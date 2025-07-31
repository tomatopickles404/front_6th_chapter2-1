import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CartProvider } from 'context/CartProvider';
import { PRODUCT_DATA } from 'shared/constants/products';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider initialProducts={PRODUCT_DATA}>
      <App />
    </CartProvider>
  </StrictMode>
);
