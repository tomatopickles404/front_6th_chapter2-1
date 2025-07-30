import {
  decreaseProductQuantity,
  getProduct,
  hasProduct,
  setLastSelectedProduct,
} from '../state/cart.js';
import { createCartItemElement } from '../utils/cart-helpers.js';
import { updateCartDisplay } from '../modules/index.js';
import { PARSING } from '../constants/business-rules.js';
import { QUANTITY_CONSTANTS, ALERT_MESSAGES } from '../constants/event.js';

/**
 * 장바구니 추가 오케스트레이터 - 단일 책임: 오케스트레이션만 담당
 */
const handleAddToCart = ({
  productSelector,
  cartDisplayArea,
  getCartState,
  setCartState,
}) => {
  const cartState = getCartState();
  const selectedItemId = productSelector.value;

  // 비즈니스 로직 실행
  const result = processAddToCartOperation({
    cartState,
    selectedItemId,
    cartDisplayArea,
    setCartState,
  });

  // 성공 시에만 UI 업데이트
  if (result.success) {
    updateUIAfterCartChange(cartDisplayArea, getCartState);
    updateLastSelectedProduct(getCartState, setCartState, selectedItemId);
  }
};

/**
 * 장바구니 추가 비즈니스 로직
 */
const processAddToCartOperation = ({
  cartState,
  selectedItemId,
  cartDisplayArea,
  setCartState,
}) => {
  const itemToAdd = validateSelectedProduct(cartState, selectedItemId);
  if (!itemToAdd) {
    return { success: false };
  }

  const existingCartItem = document.getElementById(itemToAdd.id);

  if (!existingCartItem) {
    addNewProductToCart(itemToAdd, cartDisplayArea, cartState, setCartState);
    return { success: true };
  }

  const success = increaseExistingProductQuantity(
    existingCartItem,
    itemToAdd,
    cartState,
    setCartState
  );

  return { success };
};

/**
 * 선택된 상품 유효성 검증
 */
const validateSelectedProduct = (cartState, selectedItemId) => {
  if (!selectedItemId || selectedItemId === '') {
    return null;
  }

  const itemToAdd = getProduct(cartState, selectedItemId);
  if (!itemToAdd || itemToAdd.q <= 0) {
    return null;
  }

  return itemToAdd;
};

/**
 * 새 상품을 장바구니에 추가
 */
const addNewProductToCart = (
  itemToAdd,
  cartDisplayArea,
  cartState,
  setCartState
) => {
  const newCartItem = createCartItemElement(
    itemToAdd,
    QUANTITY_CONSTANTS.increment
  );
  cartDisplayArea.appendChild(newCartItem);
  const newCartState = decreaseProductQuantity(
    cartState,
    itemToAdd.id,
    QUANTITY_CONSTANTS.increment
  );
  setCartState(newCartState);
};

/**
 * 기존 상품 수량 증가
 */
const increaseExistingProductQuantity = (
  existingCartItem,
  itemToAdd,
  cartState,
  setCartState
) => {
  const quantityElement = existingCartItem.querySelector('.quantity-number');
  const currentQuantity = Number.parseInt(
    quantityElement.textContent,
    PARSING.radix
  );
  const newQuantity = currentQuantity + QUANTITY_CONSTANTS.increment;

  if (newQuantity <= itemToAdd.q + currentQuantity) {
    quantityElement.textContent = newQuantity;
    const newCartState = decreaseProductQuantity(
      cartState,
      itemToAdd.id,
      QUANTITY_CONSTANTS.increment
    );
    setCartState(newCartState);
    return true;
  }

  alert(ALERT_MESSAGES.insufficientStock);
  return false;
};

/**
 * 장바구니 변경 후 UI 업데이트
 */
const updateUIAfterCartChange = (cartDisplayArea, getCartState) => {
  const cartState = getCartState();
  updateCartDisplay({
    cartDisp: cartDisplayArea,
    prodList: cartState.productInventory,
  });
};

/**
 * 마지막 선택된 상품 업데이트
 */
const updateLastSelectedProduct = (
  getCartState,
  setCartState,
  selectedItemId
) => {
  const newCartState = setLastSelectedProduct(getCartState(), selectedItemId);
  setCartState(newCartState);
};

/**
 * 장바구니 추가 이벤트 설정
 */
export function setupAddToCartEvent({
  addToCartButton,
  productSelector,
  cartDisplayArea,
  getCartState,
  setCartState,
}) {
  addToCartButton.addEventListener('click', () => {
    handleAddToCart({
      productSelector,
      cartDisplayArea,
      getCartState,
      setCartState,
    });
  });
}
