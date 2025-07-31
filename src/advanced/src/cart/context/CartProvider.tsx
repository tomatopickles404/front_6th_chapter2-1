import { Product } from 'types';
import { useNewCart } from 'cart/hooks';
import { createSafeContext } from 'shared/utils';

const CART = 'Cart';

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

const [Provider, useCartContext] = createSafeContext<CartContextType>(CART);

export const useCart = () => useCartContext(CART);

interface CartProviderProps {
  children: React.ReactNode;
  initialProducts: Product[];
}
export function CartProvider({ children, initialProducts }: CartProviderProps) {
  const cartData = useNewCart({ initialProducts });

  return <Provider {...cartData}>{children}</Provider>;
}
