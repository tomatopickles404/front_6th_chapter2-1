import { createContext, useContext } from 'react';
import { Product } from 'types';
import { useNewCart } from 'hooks';

interface CartContextType {
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
  updateSaleStatus: (productId: string, saleInfo: any) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({
  children,
  initialProducts,
}: {
  children: React.ReactNode;
  initialProducts: Product[];
}) {
  const cartData = useNewCart({ initialProducts });

  return (
    <CartContext.Provider value={cartData}>{children}</CartContext.Provider>
  );
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
