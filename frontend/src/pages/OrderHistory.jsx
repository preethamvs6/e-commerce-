import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, Clock, MapPin, CreditCard } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders', error);
        showToast('Failed to load order history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const getStatusStyle = (status) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-850 dark:text-gray-400 dark:border-gray-800';
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-5">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-900/10 border border-gray-100 dark:border-gray-850 rounded-3xl p-8">
          <span className="text-5xl mb-4">📦</span>
          <h2 className="text-xl font-bold text-gray-850 dark:text-white">No orders placed yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">You haven't checked out any orders yet. Browse our selection and fill your cart!</p>
          <Link
            to="/products"
            className="mt-6 flex items-center space-x-2 rounded-2xl bg-primary-505 px-6 py-3 font-semibold text-white hover:bg-primary-600 transition-colors dark:bg-primary-600 dark:hover:bg-primary-700 shadow-md shadow-primary-505/20"
          >
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div
                key={order.id}
                className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-850 dark:bg-gray-900/30 overflow-hidden"
              >
                {/* Header Summary */}
                <div
                  onClick={() => toggleOrderExpand(order.id)}
                  className="flex flex-col sm:flex-row justify-between sm:items-center p-6 gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/35 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary-505 dark:text-primary-400">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-850 dark:text-white">Order #QS-{order.id}</h4>
                      <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-400 uppercase">Total Amount</p>
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</p>
                    </div>

                    <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>

                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/20 p-6 space-y-6">
                    
                    {/* Meta info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-300">Shipping Address</p>
                          <p className="mt-1 leading-relaxed">{order.shippingAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CreditCard className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-300">Payment Method</p>
                          <p className="mt-1">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'PAYPAL' ? 'PayPal Wallet' : 'Credit / Debit Card'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase">Items Purchased</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-850 p-3 rounded-2xl">
                            <div className="flex items-center space-x-3 truncate">
                              <img
                                src={item.productImageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
                                alt={item.productName}
                                className="h-10 w-10 object-cover rounded-xl border"
                              />
                              <div className="truncate">
                                <p className="font-bold text-xs truncate w-48 sm:w-80 dark:text-gray-200">{item.productName}</p>
                                <p className="text-[10px] text-gray-400">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-extrabold text-xs dark:text-gray-100">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
