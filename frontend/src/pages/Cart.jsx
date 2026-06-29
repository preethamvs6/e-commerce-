import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { setCart } from '../redux/slices/cartSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, totalAmount } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cart');
        dispatch(setCart(res.data));
      } catch (error) {
        console.error('Error fetching cart', error);
        showToast('Could not load shopping cart', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [dispatch]);

  const handleQuantityUpdate = async (productId, quantity, stock) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    if (quantity > stock) {
      showToast(`Cannot exceed available stock (${stock})`, 'error');
      return;
    }

    try {
      const res = await api.put(`/cart/${productId}?quantity=${quantity}`);
      dispatch(setCart([res.data])); // the endpoint returns the single updated CartItem, so we reload the whole cart to get updated totals!
      // To get the full updated cart, let's fetch it again
      const cartRes = await api.get('/cart');
      dispatch(setCart(cartRes.data));
    } catch (error) {
      console.error('Error updating quantity', error);
      showToast(error.response?.data?.message || 'Error updating cart item quantity', 'error');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      const cartRes = await api.get('/cart');
      dispatch(setCart(cartRes.data));
      showToast('Item removed from cart', 'info');
    } catch (error) {
      console.error('Error removing item', error);
      showToast('Could not remove item', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      await api.delete('/cart');
      dispatch(setCart([]));
      showToast('Cart cleared', 'info');
    } catch (error) {
      console.error('Error clearing cart', error);
      showToast('Could not clear cart', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-5">
        Your Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-900/10 border border-gray-100 dark:border-gray-850 rounded-3xl p-8">
          <span className="text-5xl mb-4">🛒</span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your cart is empty</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/products"
            className="mt-6 flex items-center space-x-2 rounded-2xl bg-primary-505 px-6 py-3 font-semibold text-white hover:bg-primary-600 transition-colors dark:bg-primary-600 dark:hover:bg-primary-700 shadow-md shadow-primary-505/20"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Product details</span>
              <button
                onClick={handleClearCart}
                className="text-xs font-semibold text-rose-505 hover:underline dark:text-rose-450"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-white dark:border-gray-850 dark:bg-gray-900/30"
                >
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <img
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
                      alt={item.productName}
                      className="h-16 w-16 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                    />
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-bold text-gray-850 dark:text-white hover:text-primary-505 dark:hover:text-primary-400 transition-colors text-sm line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Price: ₹{item.productPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-250 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                      <button
                        onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1, item.productStock)}
                        className="px-2.5 py-1 text-sm font-bold hover:bg-gray-150 dark:hover:bg-gray-850"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1, item.productStock)}
                        className="px-2.5 py-1 text-sm font-bold hover:bg-gray-150 dark:hover:bg-gray-850"
                      >
                        +
                      </button>
                    </div>

                    {/* Total & Delete */}
                    <div className="flex items-center space-x-4">
                      <span className="font-extrabold text-sm text-gray-850 dark:text-white w-20 text-right">
                        ₹{(item.productPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="rounded-lg p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-505 dark:hover:bg-rose-950/20 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 space-y-6">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">Order Summary</h3>
              
              <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-850 dark:text-white">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax</span>
                  <span className="font-semibold text-gray-850 dark:text-white">₹0.00</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-extrabold text-gray-950 dark:text-white">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-primary-505 py-4 font-bold text-white shadow-xl shadow-primary-505/10 hover:bg-primary-600 transition-colors dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;
