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

// 전역 상태 (함수형 - 단일 상태 객체)
let cartState = createInitialCartState();

function main() {
  // 상태 초기화 (함수형 - 새로운 상태 반환)
  cartState = initializeCart(cartState, PRODUCT_DATA);

  // UI 생성 (HTML 템플릿 시스템 사용)
  const ui = createMainLayout();

  // 이벤트 설정
  setupManualEvents(ui);

  // UI 요소들 추출 (이벤트 핸들러에서 사용)
  const productSelector = ui.productSelector.selector;
  const addToCartButton = ui.productSelector.addButton;
  const cartDisplayArea = ui.cartDisplay.container;

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
        const newCartItem = document.createElement('div');
        newCartItem.id = itemToAdd.id;
        newCartItem.className =
          'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
        newCartItem.innerHTML = /* HTML */ `
          <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
            <div
              class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"
            ></div>
          </div>
          <div>
            <h3 class="text-base font-normal mb-1 tracking-tight">
              ${itemToAdd.onSale && itemToAdd.suggestSale
                ? '⚡💝'
                : itemToAdd.onSale
                  ? '⚡'
                  : itemToAdd.suggestSale
                    ? '💝'
                    : ''}${itemToAdd.name}
            </h3>
            <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
            <p class="text-xs text-black mb-3">
              ${itemToAdd.onSale || itemToAdd.suggestSale
                ? '<span class="line-through text-gray-400">₩' +
                  itemToAdd.originalVal.toLocaleString() +
                  '</span> <span class="' +
                  (itemToAdd.onSale && itemToAdd.suggestSale
                    ? 'text-purple-600'
                    : itemToAdd.onSale
                      ? 'text-red-500'
                      : 'text-blue-500') +
                  '">₩' +
                  itemToAdd.val.toLocaleString() +
                  '</span>'
                : '₩' + itemToAdd.val.toLocaleString()}
            </p>
            <div class="flex items-center gap-4">
              <button
                class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
                data-product-id="${itemToAdd.id}"
                data-change="-1"
              >
                −
              </button>
              <span
                class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums"
                >1</span
              >
              <button
                class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
                data-product-id="${itemToAdd.id}"
                data-change="1"
              >
                +
              </button>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg mb-2 tracking-tight tabular-nums">
              ${itemToAdd.onSale || itemToAdd.suggestSale
                ? '<span class="line-through text-gray-400">₩' +
                  itemToAdd.originalVal.toLocaleString() +
                  '</span> <span class="' +
                  (itemToAdd.onSale && itemToAdd.suggestSale
                    ? 'text-purple-600'
                    : itemToAdd.onSale
                      ? 'text-red-500'
                      : 'text-blue-500') +
                  '">₩' +
                  itemToAdd.val.toLocaleString() +
                  '</span>'
                : '₩' + itemToAdd.val.toLocaleString()}
            </div>
            <a
              class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
              data-product-id="${itemToAdd.id}"
              >Remove</a
            >
          </div>
        `;
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
