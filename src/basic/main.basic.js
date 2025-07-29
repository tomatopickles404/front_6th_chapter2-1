import { PRODUCT_DATA } from './constants/product-data.js';
import { SALE_EVENTS, TIMERS, PARSING } from './constants/business-rules.js';
import {
  handleSelectOptionsUpdate,
  handleCartUpdate,
  updatePricesInCart,
} from './modules/index.js';
import {
  createInitialCartState,
  initializeCart,
  getProductInventory,
  getProduct,
  hasProduct,
  decreaseProductQuantity,
  increaseProductQuantity,
  setLastSelectedProduct,
  updateProductSaleStatus,
  getLastSelectedProduct,
} from './state/cart.js';
import { createMainLayout } from './ui/index.js';
import { setupManualEvents } from './events/index.js';
import {
  extractCartItemsFromDOM,
  calculateTotalItemCount,
  calculateTotalAmount,
  generateStockStatus,
  isTuesday,
  createCartItemElement,
} from './utils/cart-helpers.js';

// 전역 상태 (함수형 - 단일 상태 객체)
let cartState = createInitialCartState();

// UI 요소 참조들
let ui = null;

/**
 * Props 기반으로 UI 전체를 다시 렌더링
 */
function updateUI() {
  if (!ui || !ui.cartDisplay) {
    return; // UI가 초기화되지 않았으면 실행하지 않음
  }

  const productInventory = getProductInventory(cartState);
  const cartItems = extractCartItemsFromDOM(
    ui.cartDisplay.container,
    productInventory
  );
  const itemCount = calculateTotalItemCount(ui.cartDisplay.container);
  const cartTotal = calculateTotalAmount(
    ui.cartDisplay.container,
    productInventory
  );
  const stockStatus = generateStockStatus(productInventory);

  // Props 데이터 구성
  const props = {
    itemCount,
    products: productInventory,
    stockStatus,
    cartItems,
    cartTotal,
    loyaltyPoints: Math.floor(cartTotal * 0.001), // 기본 포인트 계산
    discountInfo: '', // 할인 정보는 기존 모듈에서 처리
    isTuesday: isTuesday(),
  };

  // UI 재렌더링 (Props 기반)
  ui = createMainLayout(props);

  // 이벤트 재설정
  setupManualEvents(ui);
}

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

  // 이벤트 리스너들 (클로저로 지역변수 접근)
  addToCartButton.addEventListener('click', () => {
    const selectedItemId = productSelector.value;
    const hasValidItem = hasProduct(cartState, selectedItemId);
    if (!selectedItemId || !hasValidItem) {
      return;
    }
    const itemToAdd = getProduct(cartState, selectedItemId);
    if (itemToAdd && itemToAdd.q > 0) {
      const existingCartItem = document.getElementById(itemToAdd['id']);
      if (existingCartItem) {
        const quantityElement =
          existingCartItem.querySelector('.quantity-number');
        const newQuantity =
          Number.parseInt(quantityElement['textContent'], PARSING.radix) + 1;
        if (
          newQuantity <=
          itemToAdd.q +
            Number.parseInt(quantityElement.textContent, PARSING.radix)
        ) {
          quantityElement.textContent = newQuantity;
          cartState = decreaseProductQuantity(cartState, itemToAdd.id, 1);
        } else {
          alert('재고가 부족합니다.');
        }
      } else {
        // 🔄 DOM 조작 대신 CartItem 컴포넌트 사용
        const newCartItem = createCartItemElement(itemToAdd, 1);
        cartDisplayArea.appendChild(newCartItem);
        cartState = decreaseProductQuantity(cartState, itemToAdd.id, 1);
      }
      handleCartUpdate({
        cartDisp: cartDisplayArea,
        prodList: getProductInventory(cartState),
      });
      cartState = setLastSelectedProduct(cartState, selectedItemId);
    }
  });

  cartDisplayArea.addEventListener('click', event => {
    const targetElement = event.target;
    if (
      targetElement.classList.contains('quantity-change') ||
      targetElement.classList.contains('remove-item')
    ) {
      const productId = targetElement.dataset.productId;
      const cartItemElement = document.getElementById(productId);
      const correspondingProduct = getProduct(cartState, productId);

      if (targetElement.classList.contains('quantity-change')) {
        const quantityChange = Number.parseInt(
          targetElement.dataset.change,
          PARSING.radix
        );
        const quantityElement =
          cartItemElement.querySelector('.quantity-number');
        const currentQuantity = Number.parseInt(
          quantityElement.textContent,
          PARSING.radix
        );
        const newQuantity = currentQuantity + quantityChange;

        if (
          newQuantity > 0 &&
          newQuantity <= correspondingProduct.q + currentQuantity
        ) {
          quantityElement.textContent = newQuantity;
          cartState = decreaseProductQuantity(
            cartState,
            productId,
            quantityChange
          );
        } else if (newQuantity <= 0) {
          cartState = increaseProductQuantity(
            cartState,
            productId,
            currentQuantity
          );
          cartItemElement.remove();
        } else {
          alert('재고가 부족합니다.');
        }
      } else if (targetElement.classList.contains('remove-item')) {
        const quantityElement =
          cartItemElement.querySelector('.quantity-number');
        const removedQuantity = Number.parseInt(
          quantityElement.textContent,
          PARSING.radix
        );
        cartState = increaseProductQuantity(
          cartState,
          productId,
          removedQuantity
        );
        cartItemElement.remove();
      }

      handleCartUpdate({
        cartDisp: cartDisplayArea,
        prodList: getProductInventory(cartState),
      });
      handleSelectOptionsUpdate({
        sel: productSelector,
        prodList: getProductInventory(cartState),
      });
    }
  });
}

main();
