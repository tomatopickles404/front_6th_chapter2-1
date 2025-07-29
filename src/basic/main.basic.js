import { PRODUCT_DATA } from './constants/product-data.js';
import { updateProductOptions, updateCartDisplay } from './modules/index.js';
import {
  createInitialCartState,
  initializeCart,
  getProductInventory,
} from './state/cart.js';
import { createMainLayout } from './ui/index.js';
import {
  setupManualEvents,
  setupAddToCartEvent,
  setupCartItemEvents,
} from './events/index.js';
import { generateStockStatus, isTuesday } from './utils/cart-helpers.js';
import {
  useLightningSaleEffect,
  useSuggestionSaleEffect,
} from './hooks/useSaleEffects.js';

let cartState = createInitialCartState();
let ui = null;

function main() {
  // 1. 상태 초기화 (함수형 - 새로운 상태 반환)
  cartState = initializeCart(cartState, PRODUCT_DATA);

  // 2. 초기 UI 생성 (빈 Props로 시작)
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

  // 4. 이벤트 설정
  setupManualEvents(ui);

  // 5. UI 요소들 추출 (이벤트 핸들러에서 사용)
  const productSelector = ui.productSelector.selector;
  const addToCartButton = ui.productSelector.addButton;
  const cartDisplayArea = ui.cartDisplay.container;

  // 6. 기존 모듈 함수들로 추가 UI 업데이트 (호환성 유지)
  updateProductOptions({
    sel: productSelector,
    prodList: getProductInventory(cartState),
  });

  updateCartDisplay({
    cartDisp: cartDisplayArea,
    prodList: getProductInventory(cartState),
  });

  // 7. 사이드 이펙트 설정
  useLightningSaleEffect(cartState, ui);
  useSuggestionSaleEffect(cartState, ui);

  // 8. 기존 이벤트 설정 (호환성 유지)
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
