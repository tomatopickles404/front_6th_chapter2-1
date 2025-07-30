import React from 'react';
import { useCart } from '../hooks/useCart';
import { CartItem } from './CartItem';

export const CartDisplay: React.FC = () => {
  const { cartItems } = useCart();

  return (
    <div id="cart-items" className="space-y-0">
      {cartItems.map(({ product, quantity }) => (
        <CartItem key={product.id} product={product} quantity={quantity} />
      ))}
    </div>
  );
};
