import React, { useState } from 'react';
import { CartProvider } from './hooks/useCart';
import { useSaleEffects } from './hooks/useSaleEffects';
import {
  Header,
  ProductSelector,
  CartDisplay,
  OrderSummary,
  ManualOverlay,
} from './components';

// @ts-ignore
import { PRODUCT_DATA } from '../../shared/constants/product-data.js';

function App() {
  return (
    <CartProvider initialProducts={PRODUCT_DATA}>
      <AppContent />
    </CartProvider>
  );
}

function AppContent() {
  const [showHelp, setShowHelp] = useState(false);

  // 실시간 세일 효과 활성화
  useSaleEffects();

  return (
    <div
      id="app"
      className="max-w-screen-xl h-screen max-h-800 mx-auto p-8 flex flex-col"
    >
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-8">
          <Header />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Left Column */}
            <div>
              <ProductSelector />
              <CartDisplay />
            </div>

            {/* Right Column */}
            <div>
              <OrderSummary />
            </div>
          </div>
        </div>

        <ManualOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />

        {/* Help Button */}
        {!showHelp && (
          <button
            className="fixed top-4 right-4 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold hover:bg-gray-800 transition-all z-50"
            onClick={() => setShowHelp(true)}
          >
            ?
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
