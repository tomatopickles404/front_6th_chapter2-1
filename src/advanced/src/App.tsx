import { CartProvider, useSaleEffects, useShowHelp } from 'hooks';
import {
  Header,
  ProductSelector,
  CartDisplay,
  OrderSummary,
  ManualOverlay,
} from 'components';
import { PRODUCT_DATA } from 'shared/constants/products';

export default function App() {
  return (
    <CartProvider initialProducts={PRODUCT_DATA}>
      <AppContent />
    </CartProvider>
  );
}

function AppContent() {
  // 실시간 세일 효과 활성화
  useSaleEffects();

  return (
    <div
      id="app"
      className="max-w-screen-xl h-screen max-h-800 mx-auto p-8 flex flex-col"
    >
      <Header />
      <MainContent />
    </div>
  );
}

function MainContent() {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
        <SelectSection />
        <OrderSummary />
        <HelpButton />
      </div>
    </div>
  );
}

function SelectSection() {
  return (
    <div className="bg-white border border-gray-200 p-8 overflow-y-auto">
      <ProductSelector />
      <CartDisplay />
    </div>
  );
}

function HelpButton() {
  const { showHelp, handleShowHelp, handleCloseHelp } = useShowHelp();

  return (
    <div>
      <ManualOverlay isOpen={showHelp} onClose={handleCloseHelp} />

      {!showHelp && (
        <button
          className="fixed top-4 right-4 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold hover:bg-gray-800 transition-all z-50"
          onClick={handleShowHelp}
        >
          ?
        </button>
      )}
    </div>
  );
}
