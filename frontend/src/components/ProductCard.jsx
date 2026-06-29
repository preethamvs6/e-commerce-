import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import { addToWishlistLocal, removeFromWishlistLocal } from '../redux/slices/wishlistSlice';
import { setCart } from '../redux/slices/cartSlice';

const ProductCard = ({ product, onToast }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        dispatch(removeFromWishlistLocal(product.id));
        if (onToast) onToast('Removed from Wishlist', 'info');
      } else {
        await api.post(`/wishlist/${product.id}`);
        dispatch(addToWishlistLocal(product));
        if (onToast) onToast('Added to Wishlist', 'success');
      }
    } catch (error) {
      console.error('Error updating wishlist', error);
      if (onToast) onToast(error.response?.data?.message || 'Error updating wishlist', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product.stock <= 0) return;

    setCartLoading(true);
    try {
      await api.post('/cart', { productId: product.id, quantity: 1 });
      const cartRes = await api.get('/cart');
      dispatch(setCart(cartRes.data));
      if (onToast) onToast('Added to Cart!', 'success');
    } catch (error) {
      console.error('Error adding to cart', error);
      if (onToast) onToast(error.response?.data?.message || 'Error adding to cart', 'error');
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/50">

      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <span className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-md backdrop-blur-sm transition-all hover:scale-110 active:scale-95 dark:bg-gray-800/90 dark:text-gray-150"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-rose-505 text-rose-505 dark:fill-rose-400 dark:text-rose-400' : 'text-gray-400 dark:text-gray-300'
              }`}
          />
        </button>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-505 dark:text-primary-400">
          {product.categoryName || 'General'}
        </span>

        <Link to={`/products/${product.id}`} className="mt-1 block">
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-850 dark:text-gray-100 group-hover:text-primary-505 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 flex-1 text-xs text-gray-500 dark:text-gray-400">
          {product.description || 'No description provided.'}
        </p>

        {/* Price & Cart Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
          <span className="text-base font-extrabold text-gray-900 dark:text-white">
            ₹{product.price.toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || cartLoading}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${product.stock <= 0
                ? 'bg-gray-250 cursor-not-allowed text-gray-400 dark:bg-gray-850 dark:text-gray-600'
                : 'bg-primary-505 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 shadow-primary-505/10'
              }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{cartLoading ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
