import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CreditCard, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { clearCartLocal } from '../redux/slices/cartSlice';
import Toast from '../components/Toast';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // If cart is empty, redirect back to cart
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Please provide a valid shipping address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/orders', {
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
      });

      // Clear cart locally
      dispatch(clearCartLocal());
      showToast('Order Placed Successfully!', 'success');

      // Delay redirect to allow toast viewing
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      console.error('Checkout error', err);
      setError(err.response?.data?.message || 'Failed to place order. System error occurred.');
      showToast('Checkout Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

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
        Secure Checkout
      </h1>

      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Shipping Section */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 space-y-4">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary-505" />
              <span>Shipping Information</span>
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-250">{user?.name}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-250">{user?.phone || 'Not provided (add in profile)'}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Delivery Address</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter complete shipping address (building, street, city, country, postal code)"
                rows="4"
                required
                className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 space-y-4">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-505" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'CREDIT_CARD' 
                  ? 'border-primary-505 bg-primary-50/20 text-primary-505 dark:border-primary-400 dark:text-primary-400 dark:bg-primary-950/10'
                  : 'border-gray-205 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-850'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="CREDIT_CARD"
                  checked={paymentMethod === 'CREDIT_CARD'}
                  onChange={() => setPaymentMethod('CREDIT_CARD')}
                  className="sr-only"
                />
                <span className="text-sm font-bold">Credit/Debit Card</span>
              </label>

              <label className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'PAYPAL' 
                  ? 'border-primary-505 bg-primary-50/20 text-primary-505 dark:border-primary-400 dark:text-primary-400 dark:bg-primary-950/10'
                  : 'border-gray-205 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-850'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="PAYPAL"
                  checked={paymentMethod === 'PAYPAL'}
                  onChange={() => setPaymentMethod('PAYPAL')}
                  className="sr-only"
                />
                <span className="text-sm font-bold">PayPal Wallet</span>
              </label>

              <label className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'COD' 
                  ? 'border-primary-505 bg-primary-50/20 text-primary-505 dark:border-primary-400 dark:text-primary-400 dark:bg-primary-950/10'
                  : 'border-gray-205 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-850'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="sr-only"
                />
                <span className="text-sm font-bold">Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Submit Checkout */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-primary-505 py-4 font-bold text-white shadow-xl shadow-primary-505/10 hover:bg-primary-600 transition-colors disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            <span>{loading ? 'Processing Order...' : `Pay & Finalize Order (₹${totalAmount.toFixed(2)})`}</span>
          </button>
        </form>

        {/* Order Items Summary Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 space-y-6">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">Items Snapshot</h3>
            
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="h-8 w-8 object-cover rounded-lg"
                    />
                    <div className="truncate">
                      <p className="font-semibold truncate w-32 dark:text-gray-200">{item.productName}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-100">₹{(item.productPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-850 pt-4 flex justify-between text-base font-extrabold text-gray-950 dark:text-white">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
