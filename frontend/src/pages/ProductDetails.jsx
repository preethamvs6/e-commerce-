import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, ShoppingCart, Heart, Shield, RefreshCw, Truck } from 'lucide-react';
import api from '../services/api';
import { setCart } from '../redux/slices/cartSlice';
import { addToWishlistLocal, removeFromWishlistLocal } from '../redux/slices/wishlistSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.id === parseInt(id, 10));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Error fetching product details', error);
        showToast('Product not found or system error occurred', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (val) => {
    if (val < 1 || val > product.stock) return;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCartLoading(true);
    try {
      await api.post('/cart', { productId: product.id, quantity });
      const cartRes = await api.get('/cart');
      dispatch(setCart(cartRes.data));
      showToast('Added to Cart successfully!', 'success');
    } catch (error) {
      console.error('Error adding to cart', error);
      showToast(error.response?.data?.message || 'Error adding item to cart', 'error');
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        dispatch(removeFromWishlistLocal(product.id));
        showToast('Removed from Wishlist', 'info');
      } else {
        await api.post(`/wishlist/${product.id}`);
        dispatch(addToWishlistLocal(product));
        showToast('Added to Wishlist', 'success');
      }
    } catch (error) {
      console.error('Error updating wishlist', error);
      showToast('Failed to update wishlist', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block text-primary-505 hover:underline">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">

        {/* Left Column: Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="flex flex-col justify-between space-y-6">

          <div className="space-y-4">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-505 dark:bg-primary-950/20 dark:text-primary-400">
              {product.categoryName || 'Category'}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              ₹{product.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {product.description || 'No detailed description available for this item.'}
            </p>
          </div>

          <div className="space-y-6 border-t border-gray-100 dark:border-gray-800 pt-6">

            {/* Stock Alert */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  In Stock ({product.stock} units left)
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-bold">Temporarily Unavailable</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 font-bold text-lg disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 font-bold text-lg disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || cartLoading}
                className="flex-1 flex items-center justify-center space-x-2 rounded-2xl bg-primary-505 py-4 font-bold text-white shadow-xl shadow-primary-505/10 hover:bg-primary-600 transition-colors disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{cartLoading ? 'Adding to Cart...' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`flex items-center justify-center space-x-2 rounded-2xl border px-6 py-4 font-bold transition-all ${isWishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850'
                  }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-6 text-center text-[10px] text-gray-400">
              <div className="flex flex-col items-center space-y-1">
                <Truck className="h-4 w-4 text-gray-500" />
                <span>Fast Logistics</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Shield className="h-4 w-4 text-gray-500" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <RefreshCw className="h-4 w-4 text-gray-500" />
                <span>30 Day Returns</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
