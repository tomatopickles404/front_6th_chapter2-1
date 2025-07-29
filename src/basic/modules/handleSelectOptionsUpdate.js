export function handleSelectOptionsUpdate({ sel, prodList }) {
  let totalStock;
  let opt;
  let discountText;
  sel.innerHTML = '';
  totalStock = 0;

  for (let idx = 0; idx < prodList.length; idx++) {
    const product = prodList[idx];
    totalStock = totalStock + product.q;
  }

  const renderOption = i => {
    const item = prodList[i];
    opt = document.createElement('option');
    opt.value = item.id;
    discountText = '';
    if (item.onSale) {
      discountText += ' ⚡SALE';
    }
    if (item.suggestSale) {
      discountText += ' 💝추천';
    }
    if (item.q === 0) {
      opt.textContent =
        item.name + ' - ' + item.val + '원 (품절)' + discountText;
      opt.disabled = true;
      opt.className = 'text-gray-400';
    } else {
      if (item.onSale && item.suggestSale) {
        opt.textContent =
          '⚡💝' +
          item.name +
          ' - ' +
          item.originalVal +
          '원 → ' +
          item.val +
          '원 (25% SUPER SALE!)';
        opt.className = 'text-purple-600 font-bold';
      } else if (item.onSale) {
        opt.textContent =
          '⚡' +
          item.name +
          ' - ' +
          item.originalVal +
          '원 → ' +
          item.val +
          '원 (20% SALE!)';
        opt.className = 'text-red-500 font-bold';
      } else if (item.suggestSale) {
        opt.textContent =
          '💝' +
          item.name +
          ' - ' +
          item.originalVal +
          '원 → ' +
          item.val +
          '원 (5% 추천할인!)';
        opt.className = 'text-blue-500 font-bold';
      } else {
        opt.textContent = item.name + ' - ' + item.val + '원' + discountText;
      }
    }
    sel.appendChild(opt);
  };

  for (let i = 0; i < prodList.length; i++) {
    renderOption(i);
  }

  if (totalStock < 50) {
    sel.style.borderColor = 'orange';
  } else {
    sel.style.borderColor = '';
  }
}
