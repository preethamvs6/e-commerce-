import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { ArrowLeft } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Defined before useEffect so it can be referenced inside
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}&size=30`);
        setProducts(res.data.content || []);
      } catch (error) {
        console.error('Error fetching search results', error);
        showToast('Failed to load search results', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [query, showToast]);

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

      {/* Navigation */}
      <div>
        <Link
          to="/products"
          className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Products</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Search Results
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Showing results for "{query}" — {products.length} products match.
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToast={showToast}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl py-16 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No products found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            We couldn't find anything matching your search. Try double checking the spelling or using broader keywords.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;