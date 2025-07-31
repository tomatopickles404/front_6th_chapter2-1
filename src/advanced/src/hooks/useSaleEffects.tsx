import { useEffect, useCallback } from 'react';
import { useCart } from 'context/CartProvider';
import { Product } from 'types';
import { SALE_EVENTS, TIMERS } from 'shared/constants/business-rules';

// 세일 관련 상수
const SUGGESTION_SALE_DELAY_MS = 60000; // 추천세일 지연시간 60초
const SUGGESTION_SALE_INTERVAL_MS = 60000; // 추천세일 반복 간격 60초

const findLuckyItem = (productInventory: Product[]): Product | null => {
  if (productInventory.length === 0) return null;

  const luckyIdx = Math.floor(Math.random() * productInventory.length);
  const luckyItem = productInventory[luckyIdx];

  return luckyItem.q > 0 && !luckyItem.onSale ? luckyItem : null;
};

const findSuggestedProduct = (
  products: Product[],
  lastSelectedProductId?: string
): Product | null => {
  return (
    products.find(
      (product: Product) =>
        product.id !== lastSelectedProductId &&
        product.q > 0 &&
        !product.suggestSale
    ) || null
  );
};

/**
 * 실시간 세일 효과 Hook
 * 번개세일과 추천세일을 관리
 */
export function useSaleEffects() {
  const { products, updateSaleStatus } = useCart();

  // 번개세일 로직을 useCallback으로 최적화
  const handleLightningSale = useCallback(() => {
    const luckyItem = findLuckyItem(products);

    if (luckyItem) {
      updateSaleStatus(luckyItem.id, {
        val: Math.round(
          luckyItem.originalVal * SALE_EVENTS.lightning.priceMultiplier
        ),
        onSale: true,
      });
    }
  }, [products, updateSaleStatus]);

  // 추천세일 로직을 useCallback으로 최적화
  const handleSuggestionSale = useCallback(() => {
    const suggestedProduct = findSuggestedProduct(products);

    if (suggestedProduct) {
      updateSaleStatus(suggestedProduct.id, {
        val: Math.round(
          suggestedProduct.val * SALE_EVENTS.suggestion.priceMultiplier
        ),
        suggestSale: true,
      });
    }
  }, [products, updateSaleStatus]);

  useEffect(() => {
    let lightningInterval: ReturnType<typeof setInterval> | null = null;
    let suggestionInterval: ReturnType<typeof setInterval> | null = null;

    // 번개세일 시작 (랜덤 지연시간 후)
    const lightningDelay = Math.random() * TIMERS.lightningDelayMax;

    const lightningTimer = setTimeout(() => {
      lightningInterval = setInterval(handleLightningSale, TIMERS.saleInterval);
    }, lightningDelay);

    // 추천세일 시작 (60초 후)
    const suggestionTimer = setTimeout(() => {
      suggestionInterval = setInterval(
        handleSuggestionSale,
        SUGGESTION_SALE_INTERVAL_MS
      );
    }, SUGGESTION_SALE_DELAY_MS);

    return () => {
      clearTimeout(lightningTimer);
      clearTimeout(suggestionTimer);
      if (lightningInterval) clearInterval(lightningInterval);
      if (suggestionInterval) clearInterval(suggestionInterval);
    };
  }, [handleLightningSale, handleSuggestionSale]);
}
