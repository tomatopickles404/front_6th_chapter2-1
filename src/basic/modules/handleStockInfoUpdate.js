export function updateStockDisplay({ stockInfo }) {
  const stockStatusElement = document.getElementById('stock-status');

  if (stockStatusElement) {
    stockStatusElement.textContent = stockInfo;
  }
}
