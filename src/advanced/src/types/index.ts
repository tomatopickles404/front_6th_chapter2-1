// Product and Cart related types
export interface Product {
  id: string;
  name: string;
  val: number;
  originalVal: number;
  q: number;
  onSale: boolean;
  suggestSale: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  productInventory: Product[];
  cartTotalAmount: number;
  cartItemCount: number;
  lastSelectedProduct: string | null;
}

// Component Props interfaces
export interface HeaderProps {
  itemCount?: number;
}

export interface CartItemProps {
  product: Product;
  quantity?: number;
}

export interface ProductSelectorProps {
  products?: Product[];
  stockStatus?: string;
}

export interface OrderSummaryProps {
  cartTotal?: number;
  loyaltyPoints?: number;
  discountInfo?: string;
  isTuesday?: boolean;
}

export interface CartDisplayProps {
  cartItems?: CartItem[];
}

export interface ManualOverlayProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Event handler types
export interface CartEventHandlers {
  onAddToCart: (productId: string) => void;
  onRemoveFromCart: (productId: string) => void;
  onQuantityChange: (productId: string, change: number) => void;
} 