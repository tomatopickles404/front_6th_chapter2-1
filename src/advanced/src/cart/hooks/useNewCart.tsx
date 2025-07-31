import { Product, SaleInfo } from 'types';
import { getCartTotals } from 'cart/utils';
import { getStockStatus } from 'product/utils';
import { useProductInventory } from 'product/hooks';
import { useCartItems } from './useCartItems';
import { useCartActions } from './useCartActions';

interface UseNewCartProps {
  initialProducts: Product[];
}

interface UseNewCartReturn {
  // 상품 관련
  products: Product[];
  getProduct: (productId: string) => Product | null;

  // 장바구니 관련
  cartItems: Array<{ product: Product; quantity: number }>;
  getItemQuantity: (productId: string) => number;

  // 계산 관련
  cartTotal: number;
  loyaltyPoints: number;
  discountInfo: string;

  // 상태 관련
  stockStatus: string;

  // 액션 관련
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, change: number) => void;
  updateSaleStatus: (productId: string, saleInfo: SaleInfo) => void;
  clearCart: () => void;
}

export function useNewCart({
  initialProducts,
}: UseNewCartProps): UseNewCartReturn {
  const { products, updateStock, updateSaleStatus, getProduct } =
    useProductInventory(initialProducts);
  const {
    cartItems,
    addItem,
    removeItem,
    updateItemQuantity,
    getItemQuantity,
    clearCart,
  } = useCartItems(products);

  // 유틸 함수 직접 사용
  const totals = getCartTotals(cartItems);
  const stockStatus = getStockStatus(products);

  const { addToCart, removeFromCart, updateQuantity } = useCartActions({
    products,
    getProduct,
    updateStock,
    addItem,
    removeItem,
    updateItemQuantity,
    getItemQuantity,
  });

  return {
    products,
    getProduct,
    cartItems,
    getItemQuantity,
    cartTotal: totals.cartTotal,
    loyaltyPoints: totals.loyaltyPoints,
    discountInfo: totals.discountInfo,
    stockStatus,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateSaleStatus,
    clearCart,
  };
}
