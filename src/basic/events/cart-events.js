/**
 * 장바구니 비즈니스 로직 이벤트 핸들러
 * 상품 추가, 수량 변경, 삭제 등의 비즈니스 로직 담당
 */

import { PARSING } from '../constants/business-rules.js';
import {
  hasProduct,
  getProduct,
  decreaseProductQuantity,
  increaseProductQuantity,
  setLastSelectedProduct,
  getProductInventory,
} from '../state/cart.js';
import { createCartItemElement } from '../utils/cart-helpers.js';
import {
  handleCartUpdate,
  handleSelectOptionsUpdate,
} from '../modules/index.js';

/**
 * 장바구니에 상품 추가 이벤트 핸들러
 * @param {Object} params - 이벤트 핸들러 파라미터
 * @param {HTMLElement} params.addToCartButton - 장바구니 추가 버튼
 * @param {HTMLElement} params.productSelector - 상품 선택기
 * @param {HTMLElement} params.cartDisplayArea - 장바구니 표시 영역
 * @param {Function} params.getCartState - 현재 장바구니 상태 조회 함수
 * @param {Function} params.setCartState - 장바구니 상태 업데이트 함수
 */
export const setupAddToCartEvent = ({
  addToCartButton,
  productSelector,
  cartDisplayArea,
  getCartState,
  setCartState,
}) => {
  addToCartButton.addEventListener('click', () => {
    const cartState = getCartState();
    const selectedItemId = productSelector.value;
    const hasValidItem = hasProduct(cartState, selectedItemId);

    if (!selectedItemId || !hasValidItem) {
      return;
    }

    const itemToAdd = getProduct(cartState, selectedItemId);
    if (itemToAdd && itemToAdd.q > 0) {
      const existingCartItem = document.getElementById(itemToAdd.id);

      if (existingCartItem) {
        // 기존 상품 수량 증가
        const quantityElement =
          existingCartItem.querySelector('.quantity-number');
        const newQuantity =
          Number.parseInt(quantityElement.textContent, PARSING.radix) + 1;

        if (
          newQuantity <=
          itemToAdd.q +
            Number.parseInt(quantityElement.textContent, PARSING.radix)
        ) {
          quantityElement.textContent = newQuantity;
          const newCartState = decreaseProductQuantity(
            cartState,
            itemToAdd.id,
            1
          );
          setCartState(newCartState);
        } else {
          alert('재고가 부족합니다.');
        }
      } else {
        // 새 상품 추가
        const newCartItem = createCartItemElement(itemToAdd, 1);
        cartDisplayArea.appendChild(newCartItem);
        const newCartState = decreaseProductQuantity(
          cartState,
          itemToAdd.id,
          1
        );
        setCartState(newCartState);
      }

      // UI 업데이트
      handleCartUpdate({
        cartDisp: cartDisplayArea,
        prodList: getProductInventory(getCartState()),
      });

      // 마지막 선택 상품 업데이트
      const updatedCartState = setLastSelectedProduct(
        getCartState(),
        selectedItemId
      );
      setCartState(updatedCartState);
    }
  });
};

/**
 * 장바구니 아이템 수량 변경/삭제 이벤트 핸들러
 * @param {Object} params - 이벤트 핸들러 파라미터
 * @param {HTMLElement} params.cartDisplayArea - 장바구니 표시 영역
 * @param {HTMLElement} params.productSelector - 상품 선택기
 * @param {Function} params.getCartState - 현재 장바구니 상태 조회 함수
 * @param {Function} params.setCartState - 장바구니 상태 업데이트 함수
 */
export const setupCartItemEvents = ({
  cartDisplayArea,
  productSelector,
  getCartState,
  setCartState,
}) => {
  cartDisplayArea.addEventListener('click', event => {
    const targetElement = event.target;

    if (
      targetElement.classList.contains('quantity-change') ||
      targetElement.classList.contains('remove-item')
    ) {
      const cartState = getCartState();
      const productId = targetElement.dataset.productId;
      const cartItemElement = document.getElementById(productId);
      const correspondingProduct = getProduct(cartState, productId);

      if (targetElement.classList.contains('quantity-change')) {
        // 수량 변경
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
          // 수량 증가/감소
          quantityElement.textContent = newQuantity;
          const newCartState = decreaseProductQuantity(
            cartState,
            productId,
            quantityChange
          );
          setCartState(newCartState);
        } else if (newQuantity <= 0) {
          // 상품 제거
          const newCartState = increaseProductQuantity(
            cartState,
            productId,
            currentQuantity
          );
          setCartState(newCartState);
          cartItemElement.remove();
        } else {
          alert('재고가 부족합니다.');
        }
      } else if (targetElement.classList.contains('remove-item')) {
        // 상품 삭제
        const quantityElement =
          cartItemElement.querySelector('.quantity-number');
        const removedQuantity = Number.parseInt(
          quantityElement.textContent,
          PARSING.radix
        );
        const newCartState = increaseProductQuantity(
          cartState,
          productId,
          removedQuantity
        );
        setCartState(newCartState);
        cartItemElement.remove();
      }

      // UI 업데이트
      handleCartUpdate({
        cartDisp: cartDisplayArea,
        prodList: getProductInventory(getCartState()),
      });
      handleSelectOptionsUpdate({
        sel: productSelector,
        prodList: getProductInventory(getCartState()),
      });
    }
  });
};
