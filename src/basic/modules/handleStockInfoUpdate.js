// import { getStockTotal } from './getStockTotal.js';

export function handleStockInfoUpdate({ prodList, stockInfo }) {
  // const totalStock = getStockTotal(prodList);
  let infoMsg = '';

  // if (totalStock < 30) {
  // }

  prodList.forEach(item => {
    if (item.q < 5) {
      if (item.q > 0) {
        infoMsg = infoMsg + item.name + ': 재고 부족 (' + item.q + '개 남음)\n';
      } else {
        infoMsg = infoMsg + item.name + ': 품절\n';
      }
    }
  });
  stockInfo.textContent = infoMsg;
}
