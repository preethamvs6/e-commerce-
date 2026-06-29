import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Users, Briefcase, Plus, Trash2, Edit, Save, Check } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, catRes, prodRes, ordersRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/categories'),
        api.get('/products?size=100'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
      ]);

      setAnalytics(analyticsRes.data);
      setCategoriesList(catRes.data);
      setProductsList(prodRes.data.content || []);
      setOrdersList(ordersRes.data);
      setUsersList(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
      showToast('Failed to load dashboard data. Ensure ADMIN permissions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.categoryId) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
        categoryId: parseInt(newProduct.categoryId, 10),
      };

      const res = await api.post('/products', payload);
      setProductsList([res.data, ...productsList]);
      showToast('Product added successfully!', 'success');
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        categoryId: '',
      });
      
      // Refresh analytics
      const analyticsRes = await api.get('/admin/analytics');
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error adding product', error);
      showToast('Could not save product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProductsList(productsList.filter((p) => p.id !== id));
      showToast('Product deleted', 'info');
    } catch (error) {
      console.error('Error deleting product', error);
      showToast('Could not delete product', 'error');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status?status=${newStatus}`);
      setOrdersList(ordersList.map((o) => (o.id === orderId ? { ...o, status: res.data.status } : o)));
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating status', error);
      showToast('Failed to update status', 'error');
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

      {/* Title */}
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-5">
        Admin Control Console
      </h1>

      {/* Tabs Row */}
      <div className="flex border-b border-gray-105 dark:border-gray-800 gap-4 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Store Overview' },
          { id: 'products', label: 'Manage Products' },
          { id: 'orders', label: 'Track Orders' },
          { id: 'users', label: 'User Registry' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-primary-505 text-primary-505 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-8">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Sales Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 flex items-center space-x-4">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-4 text-emerald-600 dark:text-emerald-400">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Gross Revenue</p>
                <p className="text-xl font-extrabold text-gray-850 dark:text-white">₹{analytics.totalSales.toFixed(2)}</p>
              </div>
            </div>

            {/* Orders Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 flex items-center space-x-4">
              <div className="rounded-2xl bg-primary-50 dark:bg-primary-950/20 p-4 text-primary-550 dark:text-primary-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Total Invoices</p>
                <p className="text-xl font-extrabold text-gray-850 dark:text-white">{analytics.totalOrders}</p>
              </div>
            </div>

            {/* Customers Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 flex items-center space-x-4">
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 p-4 text-indigo-650 dark:text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Active Users</p>
                <p className="text-xl font-extrabold text-gray-850 dark:text-white">{analytics.totalUsers}</p>
              </div>
            </div>

            {/* Products Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 flex items-center space-x-4">
              <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/20 p-4 text-purple-650 dark:text-purple-400">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Listed Items</p>
                <p className="text-xl font-extrabold text-gray-850 dark:text-white">{analytics.totalProducts}</p>
              </div>
            </div>

          </div>

          {/* Recent Orders List */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-4">Top Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total Cost</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {analytics.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3.5 font-bold">#QS-{o.id}</td>
                      <td className="py-3.5">{o.userName}</td>
                      <td className="py-3.5 font-semibold">₹{o.totalAmount.toFixed(2)}</td>
                      <td className="py-3.5 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5">
                        <span className="rounded-xl px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Manage Products */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Add Product Form */}
          <div className="lg:col-span-1 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 space-y-4">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary-505" />
              <span>Create Product</span>
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. UltraBook Pro 15"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Category *</label>
                <select
                  required
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
                >
                  <option value="">Select Department</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Stock Count *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="25"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Image URL</label>
                <input
                  type="text"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product specifications..."
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all mt-1"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-primary-505 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
                <span>Save Product</span>
              </button>
            </form>
          </div>

          {/* Products List Grid */}
          <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-4">Catalog Inventory</h3>
            <div className="overflow-y-auto max-h-[500px] pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                    <th className="pb-3">Image</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {productsList.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
                          alt={p.name}
                          className="h-8 w-8 object-cover rounded-lg border border-gray-100"
                        />
                      </td>
                      <td className="py-2.5 font-bold truncate max-w-32">{p.name}</td>
                      <td className="py-2.5">{p.categoryName || 'General'}</td>
                      <td className="py-2.5 font-semibold">₹{p.price.toFixed(2)}</td>
                      <td className="py-2.5 font-semibold">{p.stock}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="rounded-lg p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-505 dark:hover:bg-rose-950/20 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Track Orders */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30">
          <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-4">Orders Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-105 dark:border-gray-800 text-gray-400">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Delivery Address</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ordersList.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-bold">#QS-{o.id}</td>
                    <td className="py-3">{o.userName}</td>
                    <td className="py-3 font-bold">₹{o.totalAmount.toFixed(2)}</td>
                    <td className="py-3 truncate max-w-40">{o.shippingAddress}</td>
                    <td className="py-3 text-gray-450">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                        className="rounded-lg border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-900 text-xs px-2 py-1 font-semibold focus:outline-none"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: User Registry */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-gray-105 bg-white p-6 shadow-sm dark:border-gray-850 dark:bg-gray-900/30">
          <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-4">Customer Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-105 dark:border-gray-800 text-gray-400">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 font-bold">{u.id}</td>
                    <td className="py-3 font-bold">{u.name}</td>
                    <td className="py-3 font-semibold">{u.email}</td>
                    <td className="py-3">{u.phone || 'N/A'}</td>
                    <td className="py-3">
                      <span className={`rounded-xl px-2 py-0.5 text-[10px] font-bold ${
                        u.role === 'ADMIN' 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
                          : 'bg-primary-50 text-primary-505 dark:bg-primary-950/20 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 truncate max-w-48">{u.address || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
