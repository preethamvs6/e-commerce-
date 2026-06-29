import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Mail, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { setCart } from '../redux/slices/cartSlice';
import { setWishlist } from '../redux/slices/wishlistSlice';
import Toast from '../components/Toast';

const LoginRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [toast, setToast] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        errors.name = 'Name is required';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const syncUserSession = async () => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        api.get('/cart'),
        api.get('/wishlist')
      ]);
      dispatch(setCart(cartRes.data));
      dispatch(setWishlist(wishlistRes.data));
    } catch (e) {
      console.error('Failed to sync user cart/wishlist', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(loginStart());
    try {
      if (isLogin) {
        // Login API Call
        const res = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        dispatch(loginSuccess(res.data));
        showToast('Login Successful!', 'success');
        
        // Sync cart and wishlist from DB
        await syncUserSession();

        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        // Registration API Call
        const res = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          phone: formData.phone,
        });
        dispatch(loginSuccess(res.data));
        showToast('Registration Successful!', 'success');

        await syncUserSession();
        navigate('/');
      }
    } catch (err) {
      console.error('Authentication error', err);
      const errMsg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      dispatch(loginFailure(errMsg));
      showToast(errMsg, 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-gray-900/40">
        
        {/* Header Toggle */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            {isLogin ? 'Sign In to Account' : 'Create New Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormErrors({});
              }}
              className="ml-1.5 font-bold text-primary-505 hover:underline dark:text-primary-400"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:bg-rose-950/20 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            
            {/* Name (Registration Only) */}
            {!isLogin && (
              <div>
                <label className="sr-only">Full Name</label>
                <div className="relative">
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </div>
                {formErrors.name && <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="sr-only">Email address</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              </div>
              {formErrors.email && <p className="mt-1 text-xs text-rose-500">{formErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="sr-only">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password (Min. 6 characters)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              </div>
              {formErrors.password && <p className="mt-1 text-xs text-rose-500">{formErrors.password}</p>}
            </div>

            {/* Phone & Address (Registration Only) */}
            {!isLogin && (
              <>
                <div>
                  <label className="sr-only">Phone Number</label>
                  <div className="relative">
                    <input
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="sr-only">Shipping Address</label>
                  <div className="relative">
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Shipping Address"
                      rows="2"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-505 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-2xl bg-primary-505 py-3.5 text-sm font-bold text-white hover:bg-primary-600 focus:outline-none transition-colors dark:bg-primary-600 dark:hover:bg-primary-700 shadow-xl shadow-primary-505/10"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default LoginRegister;
