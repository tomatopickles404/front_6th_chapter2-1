import { useState, useEffect } from 'react';
import { useCart } from 'hooks';

export function ProductSelector() {
  const { state, stockStatus, addToCart } = useCart();
  const [selectedProductId, setSelectedProductId] = useState('');
  const products = state.productInventory;

  //FIXME: 개선
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const handleAddToCart = () => {
    if (selectedProductId) {
      addToCart(selectedProductId);
    }
  };

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        id="product-select"
        className="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
        value={selectedProductId}
        onChange={(e) => setSelectedProductId(e.target.value)}
      >
        {products.map((product) => {
          let priceDisplay = '';

          if (product.q <= 0) {
            // 품절 상품 표시
            priceDisplay = `${product.name} - ₩${product.val.toLocaleString()} (품절)`;
          } else if (product.onSale || product.suggestSale) {
            // 할인 상품 표시
            priceDisplay = `${product.name} - ₩${product.val.toLocaleString()} (할인가)`;
          } else {
            // 일반 상품 표시
            priceDisplay = `${product.name} - ₩${product.val.toLocaleString()}`;
          }

          return (
            <option
              key={product.id}
              value={product.id}
              disabled={product.q <= 0}
            >
              {priceDisplay}
            </option>
          );
        })}
      </select>
      <button
        id="add-to-cart"
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
      <div
        id="stock-status"
        className="text-xs text-red-500 mt-3 whitespace-pre-line"
      >
        {stockStatus}
      </div>
    </div>
  );
}
