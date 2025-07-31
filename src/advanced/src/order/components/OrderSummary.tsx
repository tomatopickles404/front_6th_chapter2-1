import { useCart } from 'cart/context';
import { useOrderSummary } from 'order/hooks';
import { UI_TEXTS } from '@shared/constants/event';
import {
  OrderSummaryHeader,
  SummaryDetails,
  OrderSummaryFooter,
  CheckoutButton,
  ShippingNotice,
} from './index';

export function OrderSummary() {
  const { cartItems, cartTotal, discountInfo } = useCart();
  const {
    subtotal,
    isCurrentlyTuesday,
    itemDiscounts,
    showBulkDiscount,
    showIndividualDiscounts,
    showTuesdayDiscount,
  } = useOrderSummary();

  const { loyaltyPoints, loyaltyPointsZero } = UI_TEXTS;

  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <OrderSummaryHeader />
      <div className="flex-1 flex flex-col">
        <SummaryDetails
          cartItems={cartItems}
          subtotal={subtotal}
          showBulkDiscount={showBulkDiscount}
          showIndividualDiscounts={showIndividualDiscounts}
          itemDiscounts={itemDiscounts}
          showTuesdayDiscount={showTuesdayDiscount}
        />
        <OrderSummaryFooter
          discountInfo={discountInfo}
          cartTotal={cartTotal}
          loyaltyPoints={loyaltyPoints}
          loyaltyPointsZero={loyaltyPointsZero}
          isCurrentlyTuesday={isCurrentlyTuesday}
        />
      </div>
      <CheckoutButton />
      <ShippingNotice />
    </div>
  );
}
