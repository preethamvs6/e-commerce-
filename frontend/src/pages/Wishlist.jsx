import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { setWishlist } from '../redux/slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Wishlist = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await api.get('/wishlist');
        dispatch(setWishlist(res.data));
      } catch (error) {
        console.error('Error fetching wishlist', error);
        showToast('Failed to load wishlist products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [dispatch]);

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
        My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-900/10 border border-gray-100 dark:border-gray-850 rounded-3xl p-8">
          <span className="text-5xl mb-4">❤️</span>
          <h2 className="text-xl font-bold text-gray-850 dark:text-white">Your wishlist is empty</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">Items saved to your wishlist will appear here for easy checkouts.</p>
          <Link
            to="/products"
            className="mt-6 flex items-center space-x-2 rounded-2xl bg-primary-505 px-6 py-3 font-semibold text-white hover:bg-primary-600 transition-colors dark:bg-primary-600 dark:hover:bg-primary-700 shadow-md shadow-primary-505/20"
          >
            <Heart className="h-4 w-4" />
            <span>Browse Favorites</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
