import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Page Components
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import OrderHistory from './pages/OrderHistory';
import Category from './pages/Category';
import SearchResults from './pages/SearchResults';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';

// Sync Cart & Wishlist globally if already authenticated
import api from './services/api';
import { setCart } from './redux/slices/cartSlice';
import { setWishlist } from './redux/slices/wishlistSlice';

const AppInitializer = ({ children }) => {
  const token = localStorage.getItem('token');

  useEffect(() => {
    const syncSession = async () => {
      if (token) {
        try {
          const [cartRes, wishlistRes] = await Promise.all([
            api.get('/cart'),
            api.get('/wishlist')
          ]);
          store.dispatch(setCart(cartRes.data));
          store.dispatch(setWishlist(wishlistRes.data));
        } catch (error) {
          console.error('Failed to sync session on app mount', error);
        }
      }
    };
    syncSession();
  }, [token]);

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppInitializer>
          <Router>
            <div className="flex flex-col min-h-screen bg-gradient-to-tr from-indigo-50/70 via-white to-sky-50/70 text-gray-900 transition-colors duration-300 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 dark:text-gray-100">
              <Navbar />
              
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginRegister />} />
                  <Route path="/register" element={<LoginRegister />} />
                  <Route path="/products" element={<ProductListing />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/category/:id" element={<Category />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />

                  {/* Protected Customer Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all Redirect */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </AppInitializer>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
