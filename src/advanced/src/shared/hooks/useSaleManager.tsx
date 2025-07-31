import { Product } from 'types';
import { SALE_EVENTS, TIMERS } from '@shared/constants/business-rules';

interface SaleManagerProps {
  products: Product[];
  updateSaleStatus: (productId: string, saleInfo: any) => void;
}

interface SaleManagerReturn {
  startLightningSale: () => void;
  startSuggestionSale: () => void;
  lightningSaleConfig: {
    delay: number;
    interval: number;
  };
  suggestionSaleConfig: {
    delay: number;
    interval: number;
  };
}

export function useSaleManager({
  products,
  updateSaleStatus,
}: SaleManagerProps): SaleManagerReturn {
  const findLuckyItem = (): Product | null => {
    if (products.length === 0) return null;

    const luckyIdx = Math.floor(Math.random() * products.length);
    const luckyItem = products[luckyIdx];

    return luckyItem.q > 0 && !luckyItem.onSale ? luckyItem : null;
  };

  // 추천세일 대상 상품 찾기
  const findSuggestedProduct = (): Product | null => {
    return (
      products.find(
        (product: Product) => product.q > 0 && !product.suggestSale
      ) || null
    );
  };

  // 번개세일 시작 함수
  const startLightningSale = () => {
    const luckyItem = findLuckyItem();

    if (luckyItem) {
      updateSaleStatus(luckyItem.id, {
        val: Math.round(
          luckyItem.originalVal * SALE_EVENTS.lightning.priceMultiplier
        ),
        onSale: true,
      });
    }
  };

  // 추천세일 시작 함수
  const startSuggestionSale = () => {
    const suggestedProduct = findSuggestedProduct();

    if (suggestedProduct) {
      updateSaleStatus(suggestedProduct.id, {
        val: Math.round(
          suggestedProduct.val * SALE_EVENTS.suggestion.priceMultiplier
        ),
        suggestSale: true,
      });
    }
  };

  // 세일 설정 정보
  const lightningSaleConfig = {
    delay: Math.random() * TIMERS.lightningDelayMax,
    interval: TIMERS.saleInterval,
  };

  const suggestionSaleConfig = {
    delay: 60000, // 60초
    interval: 60000, // 60초
  };

  return {
    startLightningSale,
    startSuggestionSale,
    lightningSaleConfig,
    suggestionSaleConfig,
  };
}
