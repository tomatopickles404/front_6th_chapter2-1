import React from 'react';
import { CartItemProps } from '../types';
import { useCart } from '../hooks/useCart';

export const CartItem: React.FC<CartItemProps> = ({
  product,
  quantity = 1,
}) => {
  const { updateQuantity, removeFromCart } = useCart();

  if (!product) {
    return null;
  }

  const handleQuantityChange = (change: number) => {
    updateQuantity(product.id, change);
  };

  const handleRemove = () => {
    removeFromCart(product.id);
  };

  // 할인 상태에 따른 아이콘 표시
  const saleIcon =
    product.onSale && product.suggestSale
      ? '⚡💝'
      : product.onSale
        ? '⚡'
        : product.suggestSale
          ? '💝'
          : '';

  // 가격 표시 로직
  const renderPriceDisplay = () => {
    if (product.onSale || product.suggestSale) {
      const colorClass =
        product.onSale && product.suggestSale
          ? 'text-purple-600'
          : product.onSale
            ? 'text-red-500'
            : 'text-blue-500';

      return (
        <>
          <span className="line-through text-gray-400">
            ₩{product.originalVal.toLocaleString()}
          </span>{' '}
          <span className={colorClass}>₩{product.val.toLocaleString()}</span>
        </>
      );
    }
    return `₩${product.val.toLocaleString()}`;
  };

  // 총 가격 표시 로직
  const renderTotalPriceDisplay = () => {
    if (product.onSale || product.suggestSale) {
      const colorClass =
        product.onSale && product.suggestSale
          ? 'text-purple-600'
          : product.onSale
            ? 'text-red-500'
            : 'text-blue-500';

      return (
        <>
          <span className="line-through text-gray-400">
            ₩{(product.originalVal * quantity).toLocaleString()}
          </span>{' '}
          <span className={colorClass}>
            ₩{(product.val * quantity).toLocaleString()}
          </span>
        </>
      );
    }
    return `₩${(product.val * quantity).toLocaleString()}`;
  };

  return (
    <div
      id={product.id}
      className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
    >
      <div className="w-20 h-20 bg-gradient-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
      </div>
      <div>
        <h3 className="text-base font-normal mb-1 tracking-tight">
          {saleIcon}
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
        <p className="text-xs text-black mb-3">{renderPriceDisplay()}</p>
        <div className="flex items-center gap-4">
          <button
            className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
            data-product-id={product.id}
            data-change="-1"
            onClick={() => handleQuantityChange(-1)}
          >
            −
          </button>
          <span className="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">
            {quantity}
          </span>
          <button
            className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
            data-product-id={product.id}
            data-change="1"
            onClick={() => handleQuantityChange(1)}
          >
            +
          </button>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg mb-2 tracking-tight tabular-nums">
          {renderTotalPriceDisplay()}
        </div>
        <a
          className="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
          data-product-id={product.id}
          onClick={handleRemove}
        >
          Remove
        </a>
      </div>
    </div>
  );
};
