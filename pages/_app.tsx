import { CartProvider } from '../contexts/cartContext';
import '../styles/globals.scss'; 

function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

export default MyApp;
