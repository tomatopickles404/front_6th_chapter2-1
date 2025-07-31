import { useEffect, useState, useCallback } from 'react';
import { useCart } from 'hooks';
import { Product, CartState } from 'types';
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

const findSuggestedProduct = (cartState: CartState): Product | null => {
  const productInventory = cartState.productInventory;
  const lastSelectedProduct = cartState.lastSelectedProduct;

  return (
    productInventory.find(
      (product: Product) =>
        product.id !== lastSelectedProduct &&
        product.q > 0 &&
        !product.suggestSale
    ) || null
  );
};

const createLightningSaleAction = (product: Product) => {
  return {
    type: 'UPDATE_SALE_STATUS' as const,
    payload: {
      productId: product.id,
      saleInfo: {
        val: Math.round(
          product.originalVal * SALE_EVENTS.lightning.priceMultiplier
        ),
        onSale: true,
      },
    },
  };
};

const createSuggestionSaleAction = (product: Product) => {
  return {
    type: 'UPDATE_SALE_STATUS' as const,
    payload: {
      productId: product.id,
      saleInfo: {
        val: Math.round(product.val * SALE_EVENTS.suggestion.priceMultiplier),
        suggestSale: true,
      },
    },
  };
};

const createSaleEndAction = (productId: string) => {
  return {
    type: 'UPDATE_SALE_STATUS' as const,
    payload: {
      productId,
      saleInfo: {
        onSale: false,
      },
    },
  };
};

/**
 * 실시간 세일 효과 Hook
 * 번개세일과 추천세일을 관리
 */
export function useSaleEffects() {
  const { state, dispatch } = useCart();

  // 번개세일 로직을 useCallback으로 최적화
  const handleLightningSale = useCallback(() => {
    const luckyItem = findLuckyItem(state.productInventory);

    if (luckyItem) {
      const action = createLightningSaleAction(luckyItem);
      dispatch(action);
    }
  }, [state.productInventory, dispatch]);

  // 추천세일 로직을 useCallback으로 최적화
  const handleSuggestionSale = useCallback(() => {
    const suggestedProduct = findSuggestedProduct(state);

    if (suggestedProduct) {
      const action = createSuggestionSaleAction(suggestedProduct);
      dispatch(action);
    }
  }, [state, dispatch]);

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

/**
 * 개별 상품의 번개세일 타이머 Hook
 */
export function useLightningSaleTimer(productId: string) {
  const [isOnSale, setIsOnSale] = useState(false);
  const { dispatch } = useCart();

  const endSale = useCallback(() => {
    const action = createSaleEndAction(productId);
    dispatch(action);
    setIsOnSale(false);
  }, [productId, dispatch]);

  useEffect(() => {
    if (!isOnSale) return;

    // 30초 후 세일 종료
    const timer = setTimeout(endSale, SALE_EVENTS.lightning.duration);

    return () => clearTimeout(timer);
  }, [isOnSale, endSale]);

  return { isOnSale, setIsOnSale };
}
