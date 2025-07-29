import { PRODUCT_DATA } from './constants/product-data.js';
import {
  PRODUCT_IDS,
  SALE_EVENTS,
  TIMERS,
  PARSING,
} from './constants/business-rules.js';
import {
  handleSelectOptionsUpdate,
  handleCartUpdate,
  updatePricesInCart,
  handleStockInfoUpdate,
  updateLoyaltyPointsDisplay,
  getStockTotal,
} from './modules/index.js';

// 비즈니스 상태 (전역으로 유지)
let productInventory;
let cartTotalAmount = 0;
let cartItemCount;
let lastSelectedProduct;

// DOM 참조들은 main() 함수 내부로 이동

function main() {
  const root = document.getElementById('app');
  const header = document.createElement('div');
  const gridContainer = document.createElement('div');
  const leftColumn = document.createElement('div');
  const selectorContainer = document.createElement('div');
  const rightColumn = document.createElement('div');
  const manualToggle = document.createElement('button');
  const manualOverlay = document.createElement('div');
  const manualColumn = document.createElement('div');

  const productSelector = document.createElement('select');
  const addToCartButton = document.createElement('button');
  const cartDisplayArea = document.createElement('div');
  const stockStatusDisplay = document.createElement('div');

  // 상태 초기화
  cartTotalAmount = 0;
  cartItemCount = 0;
  lastSelectedProduct = null;
  productInventory = PRODUCT_DATA;

  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;

  productSelector.id = 'product-select';
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';
  productSelector.className =
    'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  addToCartButton.id = 'add-to-cart';
  stockStatusDisplay.id = 'stock-status';
  stockStatusDisplay.className =
    'text-xs text-red-500 mt-3 whitespace-pre-line';
  addToCartButton.innerHTML = 'Add to Cart';
  addToCartButton.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';

  selectorContainer.appendChild(productSelector);
  selectorContainer.appendChild(addToCartButton);
  selectorContainer.appendChild(stockStatusDisplay);
  leftColumn.appendChild(selectorContainer);

  cartDisplayArea.id = 'cart-items';
  leftColumn.appendChild(cartDisplayArea);

  rightColumn.className = 'bg-black text-white p-8 flex flex-col';
  rightColumn.innerHTML = `
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;

  const orderSummaryTotal = rightColumn.querySelector('#cart-total');

  manualToggle.onclick = () => {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  };
  manualToggle.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  manualToggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;

  manualOverlay.className =
    'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';
  manualOverlay.onclick = e => {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  };

  manualColumn.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  manualColumn.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br>
            • ⚡번개세일: 20%<br>
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br>
            • 키보드+마우스: +50p<br>
            • 풀세트: +100p<br>
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `;

  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);

  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);

  let initialStockTotal = 0;
  for (let i = 0; i < productInventory.length; i++) {
    initialStockTotal += productInventory[i].q;
  }

  handleSelectOptionsUpdate({
    sel: productSelector,
    prodList: productInventory,
  });
  handleCartUpdate({ cartDisp: cartDisplayArea, prodList: productInventory });

  const lightningDelay = Math.random() * TIMERS.lightningDelayMax;
  setTimeout(() => {
    setInterval(() => {
      const luckyIdx = Math.floor(Math.random() * productInventory.length);
      const luckyItem = productInventory[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round(
          luckyItem.originalVal * SALE_EVENTS.lightning.priceMultiplier
        );
        luckyItem.onSale = true;
        alert(
          '⚡번개세일! ' +
            luckyItem.name +
            '이(가) ' +
            SALE_EVENTS.lightning.discountRate * 100 +
            '% 할인 중입니다!'
        );
        handleSelectOptionsUpdate({
          sel: productSelector,
          prodList: productInventory,
        });
        updatePricesInCart({ cartDisp: cartDisplayArea, totalCount: 0 });
      }
    }, TIMERS.saleInterval);
  }, lightningDelay);

  setTimeout(() => {
    setInterval(() => {
      if (cartDisplayArea.children.length === 0) {
        // 빈 장바구니 처리 로직은 handleCartUpdate에서 처리됨
      }
      if (lastSelectedProduct) {
        let suggestedProduct = null;
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
          suggestedProduct.val = Math.round(
            suggestedProduct.val * SALE_EVENTS.suggestion.priceMultiplier
          );
          suggestedProduct.suggestSale = true;
          handleSelectOptionsUpdate({
            sel: productSelector,
            prodList: productInventory,
          });
          updatePricesInCart({ cartDisp: cartDisplayArea, totalCount: 0 });
        }
      }
    }, 60000);
  }, Math.random() * TIMERS.suggestionDelayMax);

  // 이벤트 리스너들 (클로저로 지역변수 접근)
  addToCartButton.addEventListener('click', () => {
    const selectedItemId = productSelector.value;
    let hasValidItem = false;
    for (let idx = 0; idx < productInventory.length; idx++) {
      if (productInventory[idx].id === selectedItemId) {
        hasValidItem = true;
        break;
      }
    }
    if (!selectedItemId || !hasValidItem) {
      return;
    }
    let itemToAdd = null;
    for (let j = 0; j < productInventory.length; j++) {
      if (productInventory[j].id === selectedItemId) {
        itemToAdd = productInventory[j];
        break;
      }
    }
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
          itemToAdd['q']--;
        } else {
          alert('재고가 부족합니다.');
        }
      } else {
        const newCartItem = document.createElement('div');
        newCartItem.id = itemToAdd.id;
        newCartItem.className =
          'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
        newCartItem.innerHTML = `
          <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
            <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
          </div>
          <div>
            <h3 class="text-base font-normal mb-1 tracking-tight">${
              itemToAdd.onSale && itemToAdd.suggestSale
                ? '⚡💝'
                : itemToAdd.onSale
                  ? '⚡'
                  : itemToAdd.suggestSale
                    ? '💝'
                    : ''
            }${itemToAdd.name}</h3>
            <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
            <p class="text-xs text-black mb-3">${
              itemToAdd.onSale || itemToAdd.suggestSale
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
                : '₩' + itemToAdd.val.toLocaleString()
            }</p>
            <div class="flex items-center gap-4">
              <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${
                itemToAdd.id
              }" data-change="-1">−</button>
              <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
              <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${
                itemToAdd.id
              }" data-change="1">+</button>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg mb-2 tracking-tight tabular-nums">${
              itemToAdd.onSale || itemToAdd.suggestSale
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
                : '₩' + itemToAdd.val.toLocaleString()
            }</div>
            <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${
              itemToAdd.id
            }">Remove</a>
          </div>
        `;
        cartDisplayArea.appendChild(newCartItem);
        itemToAdd.q--;
      }
      handleCartUpdate({
        cartDisp: cartDisplayArea,
        prodList: productInventory,
      });
      lastSelectedProduct = selectedItemId;
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
      let correspondingProduct = null;
      for (
        let productIndex = 0;
        productIndex < productInventory.length;
        productIndex++
      ) {
        if (productInventory[productIndex].id === productId) {
          correspondingProduct = productInventory[productIndex];
          break;
        }
      }
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
          correspondingProduct.q -= quantityChange;
        } else if (newQuantity <= 0) {
          correspondingProduct.q += currentQuantity;
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
        correspondingProduct.q += removedQuantity;
        cartItemElement.remove();
      }
      handleCartUpdate({
        cartDisp: cartDisplayArea,
        prodList: productInventory,
      });
      handleSelectOptionsUpdate({
        sel: productSelector,
        prodList: productInventory,
      });
    }
  });
}

main();
