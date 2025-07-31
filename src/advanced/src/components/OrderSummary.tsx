import { useCart } from 'hooks';
import { UI_TEXTS } from 'shared/constants/event';

export function OrderSummary() {
  const { cartTotal, discountInfo } = useCart();
  const isTuesday = new Date().getDay() === 2;
  const { loyaltyPoints, loyaltyPointsZero } = UI_TEXTS;

  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">
        Order Summary
      </h2>
      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3"></div>
        <div className="mt-auto">
          <div id="discount-info" className="mb-4 text-white/50">
            {discountInfo}
          </div>
          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">
                ₩{cartTotal.toLocaleString()}
              </div>
            </div>
            <div
              id="loyalty-points"
              className="text-xs text-blue-400 mt-2 text-right"
            >
              {Number(loyaltyPoints) > 0
                ? loyaltyPoints.replace('{points}', loyaltyPoints)
                : loyaltyPointsZero.replace('{points}', '0')}
            </div>
          </div>
          <div
            id="tuesday-special"
            className={`mt-4 p-3 bg-white/10 rounded-lg ${
              isTuesday ? '' : 'hidden'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xs">🎉</span>
              <span className="text-xs uppercase tracking-wide">
                Tuesday Special 10% Applied
              </span>
            </div>
          </div>
        </div>
      </div>
      <button className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
        Proceed to Checkout
      </button>
      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.
        <br />
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    </div>
  );
}
