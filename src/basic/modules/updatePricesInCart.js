export function updatePricesInCart({ cartDisp, totalCount }) {
  for (let j = 0; j < cartDisp.children.length; j++) {
    totalCount += Number.parseInt(
      cartDisp.children[j].querySelector('.quantity-number').textContent,
      10
    );
  }
}
