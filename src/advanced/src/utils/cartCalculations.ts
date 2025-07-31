import {
  CartItem,
  Product,
  DiscountRates,
  ItemDiscountResult,
  CartTotalCalculation,
} from '../types';

// 할인율 상수 정의
const PRODUCT_DISCOUNT_RATES: DiscountRates = {
  p1: 0.1, // keyboard
  p2: 0.15, // mouse
  p3: 0.2, // monitor arm
  p4: 0.05, // laptop pouch
  p5: 0.25, // speaker
};

const DISCOUNT_THRESHOLDS = {
  INDIVIDUAL_ITEM_MIN: 10, // 개별 상품 할인 최소 수량
  BULK_DISCOUNT_MIN: 30, // 벌크 할인 최소 수량
  BULK_DISCOUNT_RATE: 0.25, // 벌크 할인율 25%
  TUESDAY_DISCOUNT_RATE: 0.1, // 화요일 할인율 10%
} as const;

const LOYALTY_POINT_RATES = {
  BASE_RATE: 1000, // 1000원당 1포인트
  TUESDAY_MULTIPLIER: 2, // 화요일 2배
  KEYBOARD_MOUSE_BONUS: 50, // 키보드+마우스 세트 보너스
  FULL_SET_BONUS: 100, // 풀세트 보너스
  QUANTITY_BONUSES: {
    TEN_ITEMS: 20,
    TWENTY_ITEMS: 50,
    THIRTY_ITEMS: 100,
  },
} as const;

// 개별 상품 할인 계산
export const getItemDiscount = (
  product: Product,
  quantity: number
): ItemDiscountResult => {
  const itemTotal = product.val * quantity;
  let itemDiscount = 0;

  // 10개 이상 구매 시 개별 할인 적용
  if (quantity >= DISCOUNT_THRESHOLDS.INDIVIDUAL_ITEM_MIN) {
    itemDiscount = PRODUCT_DISCOUNT_RATES[product.id] || 0;
  }

  return {
    itemTotal,
    itemDiscount,
    quantity,
    product,
  };
};

// 화요일 여부 확인
export const isTuesday = (): boolean => {
  return new Date().getDay() === 2;
};

// 포인트 계산
export const getLoyaltyPoints = (
  cartItems: CartItem[],
  finalTotal: number
): number => {
  const basePoints = Math.floor(finalTotal / LOYALTY_POINT_RATES.BASE_RATE);
  let points = basePoints;

  // 화요일 보너스 (2배)
  const isCurrentlyTuesday = isTuesday();
  if (isCurrentlyTuesday && basePoints > 0) {
    points = basePoints * LOYALTY_POINT_RATES.TUESDAY_MULTIPLIER;
  }

  // 상품 세트 보너스 계산
  const hasKeyboard = cartItems.some((item) => item.product.id === 'p1');
  const hasMouse = cartItems.some((item) => item.product.id === 'p2');
  const hasMonitorArm = cartItems.some((item) => item.product.id === 'p3');

  if (hasKeyboard && hasMouse) {
    points += LOYALTY_POINT_RATES.KEYBOARD_MOUSE_BONUS;
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    points += LOYALTY_POINT_RATES.FULL_SET_BONUS;
  }

  // 수량 보너스 계산
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity >= 30) {
    points += LOYALTY_POINT_RATES.QUANTITY_BONUSES.THIRTY_ITEMS;
  } else if (totalQuantity >= 20) {
    points += LOYALTY_POINT_RATES.QUANTITY_BONUSES.TWENTY_ITEMS;
  } else if (totalQuantity >= 10) {
    points += LOYALTY_POINT_RATES.QUANTITY_BONUSES.TEN_ITEMS;
  }

  return points;
};

// 장바구니 총액 계산 (메인 계산 함수)
export const getCartTotals = (cartItems: CartItem[]): CartTotalCalculation => {
  if (cartItems.length === 0) {
    return { cartTotal: 0, loyaltyPoints: 0, discountInfo: '' };
  }

  //  개별 상품 할인 계산
  const itemResults = cartItems.map(({ product, quantity }) =>
    getItemDiscount(product, quantity)
  );

  // 기본 총액 계산
  const subtotal = itemResults.reduce(
    (sum, result) => sum + result.itemTotal,
    0
  );
  const totalQuantity = itemResults.reduce(
    (sum, result) => sum + result.quantity,
    0
  );

  // 개별 할인 적용
  let totalAfterIndividualDiscounts = itemResults.reduce(
    (sum, result) => sum + result.itemTotal * (1 - result.itemDiscount),
    0
  );

  let finalTotal = totalAfterIndividualDiscounts;
  const originalTotal = subtotal;

  // 벌크 할인 적용 (개별 할인보다 우선)
  if (totalQuantity >= DISCOUNT_THRESHOLDS.BULK_DISCOUNT_MIN) {
    finalTotal = subtotal * (1 - DISCOUNT_THRESHOLDS.BULK_DISCOUNT_RATE);
  }

  // 화요일 할인 적용 (추가 할인)
  const isCurrentlyTuesday = isTuesday();
  if (isCurrentlyTuesday) {
    finalTotal = finalTotal * (1 - DISCOUNT_THRESHOLDS.TUESDAY_DISCOUNT_RATE);
  }

  // 할인율 계산
  const finalDiscountRate =
    originalTotal === 0 ? 0 : (originalTotal - finalTotal) / originalTotal;
  const discountPercent =
    finalDiscountRate > 0 ? `${(finalDiscountRate * 100).toFixed(1)}%` : '';

  // 포인트 계산
  const loyaltyPoints = getLoyaltyPoints(cartItems, finalTotal);

  return {
    cartTotal: Math.floor(finalTotal),
    loyaltyPoints,
    discountInfo: discountPercent,
  };
};
