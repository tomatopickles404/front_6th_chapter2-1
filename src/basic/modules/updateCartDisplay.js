import { PRODUCT_IDS } from '../constants/business-rules.js';
import { updateStockDisplay } from './updateStockDisplay.js';

/**
 * 장바구니 표시 영역 업데이트
 * 장바구니 아이템, 총액, 포인트 등을 계산하고 표시
 */
export function updateCartDisplay({ cartDisp, prodList }) {
  const cartItems = cartDisp.children;
  let totalAmount = 0;
  let itemCount = 0;
  let subtotal = 0;
  const itemDiscounts = [];
  const lowStockItems = [];

  // 재고 부족 상품 확인
  for (let idx = 0; idx < prodList.length; idx++) {
    if (prodList[idx].q < 5 && prodList[idx].q > 0) {
      lowStockItems.push(prodList[idx].name);
    }
  }

  // 장바구니 아이템별 가격 계산 및 할인 적용
  for (let i = 0; i < cartItems.length; i++) {
    const cartItem = cartItems[i];
    let currentProduct = null;

    for (let j = 0; j < prodList.length; j++) {
      if (prodList[j].id === cartItem.id) {
        currentProduct = prodList[j];
        break;
      }
    }

    if (currentProduct) {
      const quantityElement = cartItem.querySelector('.quantity-number');
      const quantity = parseInt(quantityElement.textContent, 10);
      const itemTotal = currentProduct.val * quantity;
      let discount = 0;

      itemCount += quantity;
      subtotal += itemTotal;

      // 개별 아이템 할인 적용 (10개 이상)
      if (quantity >= 10) {
        if (currentProduct.id === PRODUCT_IDS.keyboard) {
          discount = 10 / 100;
        } else if (currentProduct.id === PRODUCT_IDS.mouse) {
          discount = 15 / 100;
        } else if (currentProduct.id === PRODUCT_IDS.monitorArm) {
          discount = 20 / 100;
        } else if (currentProduct.id === PRODUCT_IDS.laptopCase) {
          discount = 5 / 100;
        } else if (currentProduct.id === PRODUCT_IDS.speaker) {
          discount = 25 / 100;
        }

        if (discount > 0) {
          itemDiscounts.push({
            name: currentProduct.name,
            discount: discount * 100,
          });
        }
      }

      totalAmount += itemTotal * (1 - discount);

      // 가격 표시 업데이트
      const priceElement = cartItem.querySelector('.text-lg');
      if (priceElement) {
        if (currentProduct.onSale || currentProduct.suggestSale) {
          const originalPrice = currentProduct.originalVal * quantity;
          const salePrice = currentProduct.val * quantity;

          let saleClass = '';
          if (currentProduct.onSale && currentProduct.suggestSale) {
            saleClass = 'text-purple-600';
          } else if (currentProduct.onSale) {
            saleClass = 'text-red-500';
          } else {
            saleClass = 'text-blue-500';
          }

          priceElement.innerHTML = `
            <span class="line-through text-gray-400">₩${originalPrice.toLocaleString()}</span>
            <span class="${saleClass}">₩${salePrice.toLocaleString()}</span>
          `;
        } else {
          priceElement.textContent = `₩${itemTotal.toLocaleString()}`;
        }
      }

      // 10개 이상 구매 시 굵은 글씨
      const priceElements = cartItem.querySelectorAll('.text-lg, .text-xs');
      priceElements.forEach(function (elem) {
        if (elem.classList.contains('text-lg')) {
          elem.style.fontWeight = quantity >= 10 ? 'bold' : 'normal';
        }
      });
    }
  }

  // 전체 수량 할인 적용 (30개 이상)
  let discountRate = 0;
  const originalTotal = subtotal;

  if (itemCount >= 30) {
    totalAmount = (subtotal * 75) / 100;
    discountRate = 25 / 100;
  } else {
    discountRate = (subtotal - totalAmount) / subtotal;
  }

  // 화요일 할인 적용
  const today = new Date();
  const isTuesday = today.getDay() === 2;
  const tuesdaySpecial = document.getElementById('tuesday-special');

  if (isTuesday) {
    if (totalAmount > 0) {
      totalAmount = (totalAmount * 90) / 100;
      discountRate = 1 - totalAmount / originalTotal;
      tuesdaySpecial.classList.remove('hidden');
    } else {
      tuesdaySpecial.classList.add('hidden');
    }
  } else {
    tuesdaySpecial.classList.add('hidden');
  }

  // 아이템 수 업데이트
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${itemCount} items in cart`;
  }

  // 주문 요약 업데이트
  const summaryDetails = document.getElementById('summary-details');
  if (summaryDetails) {
    summaryDetails.innerHTML = '';

    if (subtotal > 0) {
      for (let i = 0; i < cartItems.length; i++) {
        const cartItem = cartItems[i];
        let currentProduct = null;

        for (let j = 0; j < prodList.length; j++) {
          if (prodList[j].id === cartItem.id) {
            currentProduct = prodList[j];
            break;
          }
        }

        if (currentProduct) {
          const quantityElement = cartItem.querySelector('.quantity-number');
          const quantity = parseInt(quantityElement.textContent, 10);
          const itemTotal = currentProduct.val * quantity;

          summaryDetails.innerHTML += `
            <div class="flex justify-between text-xs tracking-wide text-gray-400">
              <span>${currentProduct.name} x ${quantity}</span>
              <span>₩${itemTotal.toLocaleString()}</span>
            </div>
          `;
        }
      }

      summaryDetails.innerHTML += `
        <div class="border-t border-white/10 my-3"></div>
        <div class="flex justify-between text-sm tracking-wide">
          <span>Subtotal</span>
          <span>₩${subtotal.toLocaleString()}</span>
        </div>
      `;

      // 할인 정보 표시
      if (itemCount >= 30) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
            <span class="text-xs">-25%</span>
          </div>
        `;
      } else if (itemDiscounts.length > 0) {
        itemDiscounts.forEach(function (item) {
          summaryDetails.innerHTML += `
            <div class="flex justify-between text-sm tracking-wide text-green-400">
              <span class="text-xs">${item.name} (10개↑)</span>
              <span class="text-xs">-${item.discount}%</span>
            </div>
          `;
        });
      }

      if (isTuesday) {
        if (totalAmount > 0) {
          summaryDetails.innerHTML += `
            <div class="flex justify-between text-sm tracking-wide text-purple-400">
              <span class="text-xs">🌟 화요일 추가 할인</span>
              <span class="text-xs">-10%</span>
            </div>
          `;
        }
      }

      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-gray-400">
          <span>Shipping</span>
          <span>Free</span>
        </div>
      `;
    }
  }

  // 총액 업데이트
  const cartTotal = document.getElementById('cart-total');
  if (cartTotal) {
    const totalElement = cartTotal.querySelector('.text-2xl');
    if (totalElement) {
      totalElement.textContent = `₩${Math.round(totalAmount).toLocaleString()}`;
    }
  }

  // 할인 정보 표시
  const discountInfoDiv = document.getElementById('discount-info');
  if (discountInfoDiv) {
    discountInfoDiv.innerHTML = '';

    if (discountRate > 0 && totalAmount > 0) {
      const savedAmount = originalTotal - totalAmount;
      discountInfoDiv.innerHTML = `
        <div class="bg-green-500/20 rounded-lg p-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
            <span class="text-sm font-medium text-green-400">${(discountRate * 100).toFixed(1)}%</span>
          </div>
          <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
        </div>
      `;
    }
  }

  // 포인트 계산 및 표시
  const loyaltyPointsElement = document.getElementById('loyalty-points');
  if (loyaltyPointsElement) {
    if (cartDisp.children.length === 0) {
      loyaltyPointsElement.style.display = 'none';
    } else {
      const basePoints = Math.floor(totalAmount / 1000);
      let finalPoints = 0;
      const pointsDetail = [];

      if (basePoints > 0) {
        finalPoints = basePoints;
        pointsDetail.push(`기본: ${basePoints}p`);
      }

      // 화요일 보너스
      if (new Date().getDay() === 2) {
        if (basePoints > 0) {
          finalPoints = basePoints * 2;
          pointsDetail.push('화요일 2배');
        }
      }

      // 상품별 보너스 포인트
      let hasKeyboard = false;
      let hasMouse = false;
      let hasMonitorArm = false;

      for (const cartItem of cartItems) {
        const product = prodList.find(p => p.id === cartItem.id);
        if (product) {
          if (product.id === PRODUCT_IDS.keyboard) {
            hasKeyboard = true;
          } else if (product.id === PRODUCT_IDS.mouse) {
            hasMouse = true;
          } else if (product.id === PRODUCT_IDS.monitorArm) {
            hasMonitorArm = true;
          }
        }
      }

      // 키보드 + 마우스 조합 보너스
      if (hasKeyboard && hasMouse) {
        finalPoints += 50;
        pointsDetail.push('키보드+마우스 세트 +50p');
      }

      // 풀세트 보너스
      if (hasKeyboard && hasMouse && hasMonitorArm) {
        finalPoints += 100;
        pointsDetail.push('풀세트 구매 +100p');
      }

      // 수량별 보너스
      if (itemCount >= 30) {
        finalPoints += 100;
        pointsDetail.push('대량구매(30개+) +100p');
      } else if (itemCount >= 20) {
        finalPoints += 50;
        pointsDetail.push('대량구매(20개+) +50p');
      } else if (itemCount >= 10) {
        finalPoints += 20;
        pointsDetail.push('대량구매(10개+) +20p');
      }

      if (finalPoints > 0) {
        loyaltyPointsElement.innerHTML = `
          <div>적립 포인트: <span class="font-bold">${finalPoints}p</span></div>
          <div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>
        `;
        loyaltyPointsElement.style.display = 'block';
      } else {
        loyaltyPointsElement.textContent = '적립 포인트: 0p';
        loyaltyPointsElement.style.display = 'block';
      }
    }
  }

  // 재고 정보 업데이트
  const stockInfo = generateStockInfo(prodList);
  updateStockDisplay({ prodList, stockInfo });

  return { totalAmount, itemCount };
}

/**
 * 재고 정보 생성
 */
function generateStockInfo(prodList) {
  let stockMsg = '';

  for (let stockIdx = 0; stockIdx < prodList.length; stockIdx++) {
    const item = prodList[stockIdx];
    if (item.q < 5) {
      if (item.q > 0) {
        stockMsg += `${item.name}: 재고 부족 (${item.q}개 남음)\n`;
      } else {
        stockMsg += `${item.name}: 품절\n`;
      }
    }
  }

  return stockMsg;
}
