import { PRODUCT_DATA } from './constants/product-data.js';
import { SALE_EVENTS, TIMERS } from './constants/business-rules.js';
import {
  handleSelectOptionsUpdate,
  handleCartUpdate,
  updatePricesInCart,
} from './modules/index.js';
import {
  createInitialCartState,
  initializeCart,
  getProductInventory,
  updateProductSaleStatus,
  getLastSelectedProduct,
} from './state/cart.js';
import { createMainLayout } from './ui/index.js';
import {
  setupManualEvents,
  setupAddToCartEvent,
  setupCartItemEvents,
} from './events/index.js';
import { generateStockStatus, isTuesday } from './utils/cart-helpers.js';

let cartState = createInitialCartState();
let ui = null;

function main() {
  // 상태 초기화 (함수형 - 새로운 상태 반환)
  cartState = initializeCart(cartState, PRODUCT_DATA);

  // 초기 UI 생성 (빈 Props로 시작)
  const productInventory = getProductInventory(cartState);
  const stockStatus = generateStockStatus(productInventory);

  ui = createMainLayout({
    itemCount: 0,
    products: productInventory,
    stockStatus,
    cartItems: [],
    cartTotal: 0,
    loyaltyPoints: 0,
    discountInfo: '',
    isTuesday: isTuesday(),
  });

  // 이벤트 설정
  setupManualEvents(ui);

  // UI 요소들 추출 (이벤트 핸들러에서 사용)
  const productSelector = ui.productSelector.selector;
  const addToCartButton = ui.productSelector.addButton;
  const cartDisplayArea = ui.cartDisplay.container;

  // 기존 모듈 함수들로 추가 UI 업데이트 (호환성 유지)
  handleSelectOptionsUpdate({
    sel: productSelector,
    prodList: getProductInventory(cartState),
  });

  handleCartUpdate({
    cartDisp: cartDisplayArea,
    prodList: getProductInventory(cartState),
  });

  const lightningDelay = Math.random() * TIMERS.lightningDelayMax;
  setTimeout(() => {
    setInterval(() => {
      const productInventory = getProductInventory(cartState);
      const luckyIdx = Math.floor(Math.random() * productInventory.length);
      const luckyItem = productInventory[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        cartState = updateProductSaleStatus(cartState, luckyItem.id, {
          val: Math.round(
            luckyItem.originalVal * SALE_EVENTS.lightning.priceMultiplier
          ),
          onSale: true,
        });
        alert(
          '⚡번개세일! ' +
            luckyItem.name +
            '이(가) ' +
            SALE_EVENTS.lightning.discountRate * 100 +
            '% 할인 중입니다!'
        );
        handleSelectOptionsUpdate({
          sel: productSelector,
          prodList: getProductInventory(cartState),
        });
        updatePricesInCart({ cartDisp: cartDisplayArea, totalCount: 0 });
      }
    }, TIMERS.saleInterval);
  }, lightningDelay);

  setTimeout(() => {
    setInterval(() => {
      if (getLastSelectedProduct(cartState)) {
        let suggestedProduct = null;
        const productInventory = getProductInventory(cartState);
        const lastSelectedProduct = getLastSelectedProduct(cartState);
        for (let k = 0; k < productInventory.length; k++) {
          if (productInventory[k].id !== lastSelectedProduct) {
            if (productInventory[k].q > 0) {
              if (!productInventory[k].suggestSale) {
                suggestedProduct = productInventory[k];
                break;
              }
            }
          }
        }
        if (suggestedProduct) {
          alert(
            '💝 ' +
              suggestedProduct.name +
              '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
          );
          cartState = updateProductSaleStatus(cartState, suggestedProduct.id, {
            val: Math.round(
              suggestedProduct.val * SALE_EVENTS.suggestion.priceMultiplier
            ),
            suggestSale: true,
          });
          handleSelectOptionsUpdate({
            sel: productSelector,
            prodList: getProductInventory(cartState),
          });
          updatePricesInCart({ cartDisp: cartDisplayArea, totalCount: 0 });
        }
      }
    }, 60000);
  }, Math.random() * TIMERS.suggestionDelayMax);

  setupAddToCartEvent({
    addToCartButton,
    productSelector,
    cartDisplayArea,
    getCartState: () => cartState,
    setCartState: newState => {
      cartState = newState;
    },
  });

  setupCartItemEvents({
    cartDisplayArea,
    productSelector,
    getCartState: () => cartState,
    setCartState: newState => {
      cartState = newState;
    },
  });
}

main();
