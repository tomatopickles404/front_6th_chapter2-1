import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('advanced 테스트', () => {
  // 공통 헬퍼 함수
  const addItemsToCart = (sel, addBtn, productId, count) => {
    sel.value = productId;
    for (let i = 0; i < count; i++) {
      addBtn.click();
    }
  };

  const expectProductInfo = (option, product) => {
    expect(option.value).toBe(product.id);
    expect(option.textContent).toContain(product.name);
    expect(option.textContent).toContain(product.price);
    if (product.stock === 0) {
      expect(option.disabled).toBe(true);
      expect(option.textContent).toContain('품절');
    }
  };

  const getCartItemQuantity = (cartDisp, productId) => {
    const item = cartDisp.querySelector(`#${productId}`);
    if (!item) {
      return 0;
    }
    const qtyElement = item.querySelector('.quantity-number');
    return qtyElement ? parseInt(qtyElement.textContent, 10) : 0;
  };

  let sel,
    addBtn,
    cartDisp,
    sum,
    stockInfo,
    itemCount,
    loyaltyPoints,
    discountInfo;

  beforeEach(async () => {
    vi.useRealTimers();
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // React 앱을 위한 DOM 초기화
    document.body.innerHTML = '<div id="root"></div>';

    // React 앱 마운트
    const { createRoot } = await import('react-dom/client');
    const React = await import('react');
    const App = (await import('../src/App.tsx')).default;

    const root = createRoot(document.getElementById('root'));
    root.render(React.createElement(App));

    // 컴포넌트가 렌더링될 때까지 잠시 대기
    await new Promise((resolve) => setTimeout(resolve, 100));

    // DOM 요소 참조
    sel = document.getElementById('product-select');
    addBtn = document.getElementById('add-to-cart');
    cartDisp = document.getElementById('cart-items');
    sum = document.getElementById('cart-total');
    stockInfo = document.getElementById('stock-status');
    itemCount = document.getElementById('item-count');
    loyaltyPoints = document.getElementById('loyalty-points');
    discountInfo = document.getElementById('discount-info');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 기본 테스트: DOM 요소가 올바르게 렌더링되는지 확인
  describe('React App 기본 테스트', () => {
    it('필수 DOM 요소들이 존재해야 함', () => {
      // 헤더
      expect(document.querySelector('h1').textContent).toContain(
        '🛒 Hanghae Online Store'
      );
      expect(document.querySelector('.text-5xl').textContent).toContain(
        'Shopping Cart'
      );

      // 상품 선택 및 장바구니
      expect(document.querySelector('#product-select')).toBeTruthy();
      expect(document.querySelector('#cart-items')).toBeTruthy();

      // 주문 요약
      expect(document.querySelector('#cart-total')).toBeTruthy();
      expect(document.querySelector('#loyalty-points')).toBeTruthy();

      // 도움말 버튼
      const helpButton = document.querySelector('.fixed.top-4.right-4');
      expect(helpButton).toBeTruthy();
    });

    it('5개 상품이 올바른 정보로 표시되어야 함', () => {
      const expectedProducts = [
        {
          id: 'p1',
          name: '버그 없애는 키보드',
          price: '10000원',
          stock: 50,
          discount: 10,
        },
        {
          id: 'p2',
          name: '생산성 폭발 마우스',
          price: '20000원',
          stock: 30,
          discount: 15,
        },
        {
          id: 'p3',
          name: '거북목 탈출 모니터암',
          price: '30000원',
          stock: 20,
          discount: 20,
        },
        {
          id: 'p4',
          name: '에러 방지 노트북 파우치',
          price: '15000원',
          stock: 0,
          discount: 5,
        },
        {
          id: 'p5',
          name: '코딩할 때 듣는 Lo-Fi 스피커',
          price: '25000원',
          stock: 10,
          discount: 25,
        },
      ];

      expect(sel.options.length).toBe(5);

      expectedProducts.forEach((product, index) => {
        const option = sel.options[index];
        expect(option.value).toBe(product.id);
        expect(option.textContent).toContain(product.name);
      });
    });

    it('장바구니에 상품 추가 기본 동작', async () => {
      sel.value = 'p1';
      await userEvent.click(addBtn);

      // 장바구니에 상품이 추가되었는지 확인
      expect(cartDisp.children.length).toBe(1);
      expect(cartDisp.querySelector('#p1')).toBeTruthy();
    });

    it('상품 수량 조절', async () => {
      sel.value = 'p1';
      await userEvent.click(addBtn);

      const increaseBtn = cartDisp.querySelector(
        '.quantity-change[data-change="1"]'
      );
      const decreaseBtn = cartDisp.querySelector(
        '.quantity-change[data-change="-1"]'
      );

      // 증가
      await userEvent.click(increaseBtn);
      expect(cartDisp.querySelector('.quantity-number').textContent).toBe('2');

      // 감소
      await userEvent.click(decreaseBtn);
      expect(cartDisp.querySelector('.quantity-number').textContent).toBe('1');
    });

    it('상품 제거', async () => {
      sel.value = 'p1';
      await userEvent.click(addBtn);

      const removeBtn = cartDisp.querySelector('.remove-item');
      await userEvent.click(removeBtn);

      expect(cartDisp.children.length).toBe(0);
    });
  });
});
