import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { ArrowLeft } from 'lucide-react';

const Category = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get(`/categories/${id}`),
          api.get(`/products?category=${id}&size=20`)
        ]);
        setCategoryName(catRes.data.name);
        setProducts(prodRes.data.content || []);
      } catch (error) {
        console.error('Error fetching category products', error);
        showToast('Failed to load category products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [id]);

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
          Department: {categoryName || 'Loading...'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Showing {products.length} products found in this category
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
        <div className="flex flex-col items-center justify-center border border-dashed border-gray-205 dark:border-gray-800 rounded-3xl py-16 text-center">
          <span className="text-4xl mb-4">📦</span>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No products found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We haven't listed any items in this department yet.</p>
        </div>
      )}
    </div>
  );
};

export default Category;
