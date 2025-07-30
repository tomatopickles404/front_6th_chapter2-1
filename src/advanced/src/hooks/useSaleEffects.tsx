import React from 'react';
import { useCart } from './useCart';

// @ts-ignore
import {
  SALE_EVENTS,
  TIMERS,
} from '../../../shared/constants/business-rules.js';

const DELAY_SUGGESTION = 60000; // 추천세일 지연시간 60초

/**
 * 실시간 세일 효과 Hook
 * 번개세일과 추천세일을 관리
 */
export function useSaleEffects() {
  const { state, dispatch } = useCart();

  React.useEffect(() => {
    let lightningInterval: number | null = null;
    let suggestionInterval: number | null = null;

    // 번개세일 시작 (랜덤 지연시간 후)
    const lightningDelay = Math.random() * TIMERS.lightningDelayMax;

    const lightningTimer = setTimeout(() => {
      lightningInterval = startLightningSaleInterval();
    }, lightningDelay);

    // 추천세일 시작 (60초 후)
    const suggestionTimer = setTimeout(() => {
      suggestionInterval = startSuggestionSaleInterval();
    }, DELAY_SUGGESTION);

    return () => {
      clearTimeout(lightningTimer);
      clearTimeout(suggestionTimer);
      if (lightningInterval) clearInterval(lightningInterval);
      if (suggestionInterval) clearInterval(suggestionInterval);
    };
  }, []);

  // 번개세일 인터벌 시작
  const startLightningSaleInterval = () => {
    const interval = setInterval(() => {
      const luckyItem = findLuckyItem(state.productInventory);

      if (luckyItem) {
        dispatch({
          type: 'UPDATE_SALE_STATUS',
          payload: {
            productId: luckyItem.id,
            saleInfo: {
              val: Math.round(
                luckyItem.originalVal * SALE_EVENTS.lightning.priceMultiplier
              ),
              onSale: true,
            },
          },
        });
      }
    }, TIMERS.saleInterval);

    return interval;
  };

  // 추천세일 인터벌 시작
  const startSuggestionSaleInterval = () => {
    const interval = setInterval(() => {
      const suggestedProduct = findSuggestedProduct(state);

      if (suggestedProduct) {
        dispatch({
          type: 'UPDATE_SALE_STATUS',
          payload: {
            productId: suggestedProduct.id,
            saleInfo: {
              val: Math.round(
                suggestedProduct.val * SALE_EVENTS.suggestion.priceMultiplier
              ),
              suggestSale: true,
            },
          },
        });
      }
    }, DELAY_SUGGESTION);

    return interval;
  };

  // 순수 함수들
  function findLuckyItem(productInventory: any[]) {
    const luckyIdx = Math.floor(Math.random() * productInventory.length);
    const luckyItem = productInventory[luckyIdx];

    return luckyItem.q > 0 && !luckyItem.onSale ? luckyItem : null;
  }

  function findSuggestedProduct(cartState: any) {
    const productInventory = cartState.productInventory;
    const lastSelectedProduct = cartState.lastSelectedProduct;

    return productInventory.find(
      (product: any) =>
        product.id !== lastSelectedProduct &&
        product.q > 0 &&
        !product.suggestSale
    );
  }
}

/**
 * 개별 상품의 번개세일 타이머 Hook
 */
export function useLightningSaleTimer(productId: string) {
  const [isOnSale, setIsOnSale] = React.useState(false);
  const { dispatch } = useCart();

  React.useEffect(() => {
    if (!isOnSale) return;

    // 30초 후 세일 종료
    const timer = setTimeout(() => {
      dispatch({
        type: 'UPDATE_SALE_STATUS',
        payload: {
          productId,
          saleInfo: {
            onSale: false,
            // 원래 가격으로 복원
          },
        },
      });
      setIsOnSale(false);
    }, SALE_EVENTS.lightning.duration);

    return () => clearTimeout(timer);
  }, [isOnSale, productId, dispatch]);

  return { isOnSale, setIsOnSale };
}
