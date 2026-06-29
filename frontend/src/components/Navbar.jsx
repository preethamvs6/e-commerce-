import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCart, Heart, User, Search,
  LogOut, LayoutDashboard, Briefcase, X
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { clearCartLocal } from '../redux/slices/cartSlice';
import { clearWishlistLocal } from '../redux/slices/wishlistSlice';

const FONT_LINK =
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600&display=swap';

const injectFonts = () => {
  if (document.getElementById('home-fonts')) return;
  const link = document.createElement('link');
  link.id = 'home-fonts';
  link.rel = 'stylesheet';
  link.href = FONT_LINK;
  document.head.appendChild(link);
};

const s = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    width: '100%',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #f0f0f0',
    fontFamily: "'Instrument Sans', sans-serif",
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },

  /* logo */
  logo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 24,
    fontWeight: 400,
    color: '#0f0f0f',
    textDecoration: 'none',
    letterSpacing: '-0.01em',
    flexShrink: 0,
  },
  logoDot: {
    color: '#888',
  },

  /* search */
  searchWrap: {
    position: 'relative',
    flex: 1,
    maxWidth: 400,
  },
  searchInput: {
    width: '100%',
    padding: '9px 16px 9px 38px',
    fontSize: 13,
    fontFamily: "'Instrument Sans', sans-serif",
    border: '1px solid #e8e8e8',
    borderRadius: 40,
    background: '#f7f7f5',
    color: '#0f0f0f',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    boxSizing: 'border-box',
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#aaa',
    pointerEvents: 'none',
  },

  /* right icons */
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  iconBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    color: '#555',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#0f0f0f',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
  },

  /* avatar button */
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 12px 4px 4px',
    borderRadius: 40,
    border: '1px solid #e8e8e8',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: "'Instrument Sans', sans-serif",
    transition: 'border-color 0.15s',
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: '#0f0f0f',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Instrument Sans', sans-serif",
  },
  avatarName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#0f0f0f',
  },

  /* dropdown */
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    width: 220,
    background: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    zIndex: 50,
  },
  dropMeta: {
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  dropMetaLabel: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: 500,
    marginBottom: 2,
  },
  dropMetaEmail: {
    fontSize: 13,
    fontWeight: 600,
    color: '#0f0f0f',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#333',
    textDecoration: 'none',
    background: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    fontFamily: "'Instrument Sans', sans-serif",
    transition: 'background 0.12s',
    textAlign: 'left',
  },
  dropItemDanger: {
    color: '#c0392b',
  },

  /* sign in btn */
  signInBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 18px',
    background: '#0f0f0f',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Instrument Sans', sans-serif",
    borderRadius: 40,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },

  /* mobile search bar */
  mobileSearch: {
    borderTop: '1px solid #f0f0f0',
    padding: '10px 24px 12px',
  },
};

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector(s => s.auth);
  const { totalQuantity } = useSelector(s => s.cart);
  const wishlistItems = useSelector(s => s.wishlist.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropRef = useRef(null);

  useEffect(() => { injectFonts(); }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartLocal());
    dispatch(clearWishlistLocal());
    setDropdownOpen(false);
    navigate('/login');
  };

  const IconButton = ({ to, onClick, children, style }) =>
    to ? (
      <Link to={to} style={{ ...s.iconBtn, ...style }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f7f7f5'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >{children}</Link>
    ) : (
      <button onClick={onClick} style={{ ...s.iconBtn, ...style }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f7f7f5'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >{children}</button>
    );

  const SearchBar = ({ style }) => (
    <form onSubmit={handleSearch} style={{ ...s.searchWrap, ...style }}>
      <Search size={14} style={s.searchIcon} />
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        style={{
          ...s.searchInput,
          borderColor: searchFocused ? '#0f0f0f' : '#e8e8e8',
          background: searchFocused ? '#fff' : '#f7f7f5',
        }}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
          }}
        >
          <X size={13} />
        </button>
      )}
    </form>
  );

  return (
    <nav style={s.nav}>
      <div style={s.inner}>

        {/* Logo */}
        <Link to="/" style={s.logo}>
          Krato<span style={s.logoDot}>.</span>
        </Link>

        {/* Search — desktop */}
        {!isMobile && <SearchBar />}

        {/* Actions */}
        <div style={s.actions}>

          <IconButton to="/wishlist">
            <Heart size={18} />
            {wishlistItems.length > 0 && (
              <span style={s.badge}>{wishlistItems.length}</span>
            )}
          </IconButton>

          <IconButton to="/cart">
            <ShoppingCart size={18} />
            {totalQuantity > 0 && (
              <span style={s.badge}>{totalQuantity}</span>
            )}
          </IconButton>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={s.avatarBtn}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ccc'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; }}
              >
                <div style={s.avatarCircle}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                {!isMobile && (
                  <span style={s.avatarName}>{user?.name?.split(' ')[0]}</span>
                )}
              </button>

              {dropdownOpen && (
                <div style={s.dropdown}>
                  <div style={s.dropMeta}>
                    <p style={s.dropMetaLabel}>Signed in as</p>
                    <p style={s.dropMetaEmail}>{user?.email}</p>
                  </div>

                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      style={s.dropItem}
                      onClick={() => setDropdownOpen(false)}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f7f7f5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LayoutDashboard size={15} color="#888" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    style={s.dropItem}
                    onClick={() => setDropdownOpen(false)}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f7f7f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <User size={15} color="#888" />
                    My Profile
                  </Link>

                  <Link
                    to="/orders"
                    style={s.dropItem}
                    onClick={() => setDropdownOpen(false)}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f7f7f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Briefcase size={15} color="#888" />
                    Order History
                  </Link>

                  <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{ ...s.dropItem, ...s.dropItemDanger }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              style={s.signInBtn}
              onMouseEnter={e => { e.currentTarget.style.background = '#333'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0f0f0f'; }}
            >
              <User size={14} />
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Search — mobile */}
      {isMobile && (
        <div style={s.mobileSearch}>
          <SearchBar style={{ maxWidth: '100%' }} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;