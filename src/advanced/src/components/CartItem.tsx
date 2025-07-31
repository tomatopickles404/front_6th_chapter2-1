import { useCart } from 'context/CartProvider';
import { Product } from 'types';
import { commaizeNumber } from 'utils/commaizeNumberWithIUnit';
import { CartItemProps } from 'types';

export function CartItem({ product, quantity = 1 }: CartItemProps) {
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
  const saleIcon = (() => {
    if (product.onSale && product.suggestSale) return '⚡💝';
    if (product.onSale) return '⚡';
    if (product.suggestSale) return '💝';
    return '';
  })();

  // 할인 상태에 따른 가격 색상 결정
  const priceColorClass = (() => {
    if (product.onSale && product.suggestSale) return 'text-purple-600';
    if (product.onSale) return 'text-red-500';
    if (product.suggestSale) return 'text-blue-500';
    return '';
  })();

  return (
    <div
      id={product.id}
      className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
    >
      <div className="w-20 h-20 bg-gradient-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
      </div>

      <CartItemInfo
        product={product}
        quantity={quantity}
        saleIcon={saleIcon}
        priceColorClass={priceColorClass}
        handleQuantityChange={handleQuantityChange}
      />

      <CartItemPrice
        product={product}
        quantity={quantity}
        priceColorClass={priceColorClass}
        onRemove={handleRemove}
      />
    </div>
  );
}

interface CartItemInfoProps {
  product: Product;
  quantity: number;
  saleIcon: string;
  priceColorClass: string;
  handleQuantityChange: (change: number) => void;
}

function CartItemInfo({
  product,
  quantity,
  saleIcon,
  priceColorClass,
  handleQuantityChange,
}: CartItemInfoProps) {
  return (
    <div>
      <h3 className="text-base font-normal mb-1 tracking-tight">
        {saleIcon}
        {product.name}
      </h3>

      <p className="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p className="text-xs text-black mb-3">
        {product.onSale || product.suggestSale ? (
          <>
            <span className="line-through text-gray-400">
              ₩{commaizeNumber(product.originalVal)}
            </span>{' '}
            <span className={priceColorClass}>
              ₩{commaizeNumber(product.val)}
            </span>
          </>
        ) : (
          `₩${commaizeNumber(product.val)}`
        )}
      </p>
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
  );
}

interface CartItemPriceComponentProps {
  product: Product;
  quantity: number;
  priceColorClass: string;
  onRemove: () => void;
}

function CartItemPrice({
  product,
  quantity,
  priceColorClass,
  onRemove,
}: CartItemPriceComponentProps) {
  return (
    <div className="text-right">
      <div className="text-lg mb-2 tracking-tight tabular-nums">
        <span className={priceColorClass}>
          ₩{commaizeNumber(product.val * quantity)}
        </span>

        {product.onSale && product.suggestSale && (
          <span className="line-through text-gray-400">
            ₩{commaizeNumber(product.originalVal * quantity)}
          </span>
        )}
      </div>

      <a
        className="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
        data-product-id={product.id}
        onClick={onRemove}
      >
        Remove
      </a>
    </div>
  );
}
