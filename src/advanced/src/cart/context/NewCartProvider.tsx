import * as React from 'react';
import { Product, SaleInfo } from 'types';
import { useNewCart } from 'cart/hooks';
import { createSafeContext } from 'shared/utils';

interface NewCartContextType {
  // 상품 관련
  products: Product[];
  getProduct: (productId: string) => Product | null;

  // 장바구니 아이템 관련
  cartItems: Array<{ product: Product; quantity: number }>;
  getItemQuantity: (productId: string) => number;

  // 계산 관련
  cartTotal: number;
  loyaltyPoints: number;
  discountInfo: string;

  // 재고 관련
  stockStatus: string;

  // 액션 관련
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, change: number) => void;
  updateSaleStatus: (productId: string, saleInfo: SaleInfo) => void;
  clearCart: () => void;
}

const [NewCartProvider, useNewCartContext] =
  createSafeContext<NewCartContextType>('NewCart');

interface NewCartProviderProps {
  children: React.ReactNode;
  initialProducts: Product[];
}

export const NewCartProviderComponent: React.FC<NewCartProviderProps> = ({
  children,
  initialProducts,
}) => {
  const cartData = useNewCart({ initialProducts });

  return React.createElement(NewCartProvider, cartData, children);
};

export const useNewCartContextSafe = (componentName: string) => {
  return useNewCartContext(componentName);
};
