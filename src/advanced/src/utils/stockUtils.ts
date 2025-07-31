import { Product } from 'types';

const STOCK_THRESHOLDS = {
  OUT_OF_STOCK: 0,
  LOW_STOCK: 5,
} as const;

export const hasStock = (
  product: Product,
  requestedQuantity: number = 1
): boolean => {
  return product.q >= requestedQuantity;
};

export const isLowStock = (product: Product): boolean => {
  return (
    product.q > STOCK_THRESHOLDS.OUT_OF_STOCK &&
    product.q < STOCK_THRESHOLDS.LOW_STOCK
  );
};

export const isOutOfStock = (product: Product): boolean => {
  return product.q <= STOCK_THRESHOLDS.OUT_OF_STOCK;
};

export const canAddToCart = (
  product: Product,
  requestedQuantity: number = 1
): boolean => {
  return hasStock(product, requestedQuantity);
};

export const getStockStatusMessage = (product: Product): string | null => {
  if (isOutOfStock(product)) {
    return `${product.name}: 품절`;
  }

  if (isLowStock(product)) {
    return `${product.name}: 재고 부족 (${product.q}개 남음)`;
  }

  return null;
};

export const getStockStatus = (products: Product[]): string => {
  const stockMessages: string[] = [];

  products.forEach((product) => {
    const message = getStockStatusMessage(product);
    if (message) {
      stockMessages.push(message);
    }
  });

  return stockMessages.join('\n');
};

export const updateProductStock = (
  product: Product,
  change: number
): Product => {
  const newQuantity = Math.max(0, product.q + change);

  return {
    ...product,
    q: newQuantity,
  };
};

export const findProductById = (
  products: Product[],
  productId: string
): Product | null => {
  return products.find((product) => product.id === productId) || null;
};
