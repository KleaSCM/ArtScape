import { useCart } from '../contexts/cartContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY); 
const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const res = await fetch('http://localhost:8080/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cart),
    });
    const { sessionId } = await res.json();
    await stripe.redirectToCheckout({ sessionId });
  };

  return (
    <div>
      <h1>Your Cart</h1>
      <div>
        {cart.map((item) => (
          <div key={item.id}>
            <img src={item.image_url} alt={item.title} />
            <h2>{item.title}</h2>
            <p>Price: ${item.price}</p>
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </div>
        ))}
      </div>
      <h2>Total: ${total.toFixed(2)}</h2>
      <button onClick={clearCart}>Clear Cart</button>
      <button onClick={handleCheckout}>Proceed to Checkout</button>
    </div>
  );
};

export default Cart;
