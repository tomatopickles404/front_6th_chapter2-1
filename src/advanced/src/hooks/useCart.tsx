import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartState, Product, CartItem } from '../types';

// Import pure functions from basic cart.js
// @ts-ignore
import {
  createInitialCartState,
  initializeCart,
  getProductInventory,
  getProduct,
  hasStock,
  getCartTotalAmount,
  getCartItemCount,
  updateCartTotals,
  setLastSelectedProduct,
  decreaseProductQuantity,
  increaseProductQuantity,
  updateProductSaleStatus,
  canAddToCart,
} from '../../../basic/state/cart';

// Import business logic modules
// @ts-ignore
import { updateCartDisplay } from '../../../basic/modules/updateCartDisplay.js';

// Import utilities
import {
  generateStockStatus,
  isTuesday,
} from '../../../shared/utils/cart-helpers';

// Cart actions
type CartAction =
  | { type: 'INITIALIZE'; payload: Product[] }
  | { type: 'ADD_TO_CART'; payload: string }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; change: number } }
  | { type: 'UPDATE_TOTALS'; payload: { total: number; count: number } }
  | { type: 'SET_LAST_SELECTED'; payload: string }
  | {
      type: 'UPDATE_SALE_STATUS';
      payload: { productId: string; saleInfo: any };
    }
  | { type: 'REPLACE_STATE'; payload: CartState };

// Extended cart context type
interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  cartItems: CartItem[];
  cartTotal: number;
  loyaltyPoints: number;
  discountInfo: string;
  stockStatus: string;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, change: number) => void;
  updateSaleStatus: (productId: string, saleInfo: any) => void;
}

// Track actual cart items separately from inventory
interface CartItemData {
  [productId: string]: number; // quantity
}

// Cart reducer using pure functions from basic
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'INITIALIZE':
      return initializeCart(state, action.payload);

    case 'ADD_TO_CART': {
      const productId = action.payload;
      if (!canAddToCart(state, productId)) {
        return state; // Don't modify state if can't add
      }

      // Decrease product inventory
      const newState = decreaseProductQuantity(state, productId, 1);
      return setLastSelectedProduct(newState, productId);
    }

    case 'REMOVE_FROM_CART': {
      // This will be handled by cart items separately
      return state;
    }

    case 'UPDATE_QUANTITY': {
      const { productId, change } = action.payload;
      if (change > 0) {
        if (!canAddToCart(state, productId)) {
          return state; // Don't modify if can't add
        }
        return decreaseProductQuantity(state, productId, change);
      } else {
        return increaseProductQuantity(state, productId, Math.abs(change));
      }
    }

    case 'UPDATE_TOTALS':
      return updateCartTotals(
        state,
        action.payload.total,
        action.payload.count
      );

    case 'SET_LAST_SELECTED':
      return setLastSelectedProduct(state, action.payload);

    case 'UPDATE_SALE_STATUS':
      return updateProductSaleStatus(
        state,
        action.payload.productId,
        action.payload.saleInfo
      );

    case 'REPLACE_STATE':
      return action.payload;

    default:
      return state;
  }
}

// Create context
const CartContext = createContext<CartContextType | null>(null);

// Cart provider component
export const CartProvider: React.FC<{
  children: React.ReactNode;
  initialProducts: Product[];
}> = ({ children, initialProducts }) => {
  const [state, dispatch] = useReducer(cartReducer, createInitialCartState());
  const [cartItemsData, setCartItemsData] = React.useState<CartItemData>({});

  // Initialize cart with product data
  useEffect(() => {
    dispatch({ type: 'INITIALIZE', payload: initialProducts });
  }, [initialProducts]);

  // Calculate cart items from cart data
  const cartItems: CartItem[] = React.useMemo(() => {
    const products = getProductInventory(state);
    const items: CartItem[] = [];

    Object.entries(cartItemsData).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        const product = products.find((p) => p.id === productId);
        if (product) {
          items.push({
            product,
            quantity,
          });
        }
      }
    });

    return items;
  }, [state.productInventory, cartItemsData]);

  // Calculate cart total and related values using exact basic logic
  const { cartTotal, loyaltyPoints, discountInfo } = React.useMemo(() => {
    if (cartItems.length === 0) {
      return { cartTotal: 0, loyaltyPoints: 0, discountInfo: '' };
    }

    // 1. Calculate item totals and individual discounts
    const itemResults = cartItems.map(({ product, quantity }) => {
      const itemTotal = product.val * quantity;
      let itemDiscount = 0;

      // Individual product discount (10+ items)
      if (quantity >= 10) {
        const discountRates: { [key: string]: number } = {
          p1: 0.1, // keyboard
          p2: 0.15, // mouse
          p3: 0.2, // monitor arm
          p4: 0.05, // laptop pouch
          p5: 0.25, // speaker
        };
        itemDiscount = discountRates[product.id] || 0;
      }

      return {
        itemTotal,
        itemDiscount,
        quantity,
        product,
      };
    });

    // 2. Calculate totals
    const subtotal = itemResults.reduce((sum, r) => sum + r.itemTotal, 0);
    const totalQuantity = itemResults.reduce((sum, r) => sum + r.quantity, 0);

    // Apply individual discounts first
    let totalAfterIndividualDiscounts = itemResults.reduce(
      (sum, r) => sum + r.itemTotal * (1 - r.itemDiscount),
      0
    );

    let finalTotal = totalAfterIndividualDiscounts;
    let originalTotal = subtotal;

    // 3. Apply bulk discount (overrides individual discounts)
    if (totalQuantity >= 30) {
      finalTotal = subtotal * 0.75; // 25% discount
    }

    // 4. Apply Tuesday discount (additional)
    const isCurrentlyTuesday = isTuesday();
    if (isCurrentlyTuesday) {
      finalTotal = finalTotal * 0.9; // 10% additional discount
    }

    // 5. Calculate final discount rate
    const finalDiscountRate =
      originalTotal === 0 ? 0 : (originalTotal - finalTotal) / originalTotal;
    const discountPercent =
      finalDiscountRate > 0 ? (finalDiscountRate * 100).toFixed(1) + '%' : '';

    // 6. Calculate loyalty points
    const basePoints = Math.floor(finalTotal / 1000); // 0.1% base rate
    let points = basePoints;

    // Tuesday bonus (2x base points)
    if (isCurrentlyTuesday && basePoints > 0) {
      points = basePoints * 2;
    }

    // Product set bonuses
    const hasKeyboard = cartItems.some((item) => item.product.id === 'p1');
    const hasMouse = cartItems.some((item) => item.product.id === 'p2');
    const hasMonitorArm = cartItems.some((item) => item.product.id === 'p3');

    if (hasKeyboard && hasMouse) {
      points += 50; // Keyboard+Mouse set bonus
    }

    if (hasKeyboard && hasMouse && hasMonitorArm) {
      points += 100; // Full set bonus
    }

    // Quantity bonuses
    if (totalQuantity >= 30) {
      points += 100;
    } else if (totalQuantity >= 20) {
      points += 50;
    } else if (totalQuantity >= 10) {
      points += 20;
    }

    return {
      cartTotal: Math.floor(finalTotal),
      loyaltyPoints: points,
      discountInfo: discountPercent,
    };
  }, [cartItems]);

  // Calculate stock status (exact basic logic)
  const stockStatus = React.useMemo(() => {
    const inventory = getProductInventory(state);
    const stockMessages: string[] = [];

    inventory.forEach((product) => {
      if (product.q <= 0) {
        stockMessages.push(`${product.name}: 품절`);
      } else if (product.q < 5) {
        stockMessages.push(`${product.name}: 재고 부족 (${product.q}개 남음)`);
      }
    });

    return stockMessages.join('\n');
  }, [state.productInventory]);

  // Action creators
  const addToCart = (productId: string) => {
    const product = getProduct(state, productId);
    if (!product || product.q <= 0) {
      alert('재고가 부족합니다.');
      return;
    }

    dispatch({ type: 'ADD_TO_CART', payload: productId });
    setCartItemsData((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    const currentQuantity = cartItemsData[productId] || 0;
    if (currentQuantity > 0) {
      // Restore inventory
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { productId, change: -currentQuantity },
      });

      // Remove from cart
      setCartItemsData((prev) => ({
        ...prev,
        [productId]: 0,
      }));
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    const currentQuantity = cartItemsData[productId] || 0;
    const newQuantity = currentQuantity + change;

    if (newQuantity <= 0) {
      // Remove from cart
      removeFromCart(productId);
      return;
    }

    // Basic과 동일한 재고 검증 로직: newQuantity > product.q + currentQuantity
    const product = getProduct(state, productId);
    if (!product) return;

    if (newQuantity > product.q + currentQuantity) {
      alert('재고가 부족합니다.');
      return;
    }

    // 재고에서 차감 (증가한 만큼만)
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, change } });
    setCartItemsData((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const updateSaleStatus = (productId: string, saleInfo: any) => {
    dispatch({ type: 'UPDATE_SALE_STATUS', payload: { productId, saleInfo } });
  };

  const value: CartContextType = {
    state,
    dispatch,
    cartItems,
    cartTotal,
    loyaltyPoints,
    discountInfo,
    stockStatus,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateSaleStatus,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
