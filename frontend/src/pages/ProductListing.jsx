import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { ChevronLeft, ChevronRight, SlidersHorizontal, SearchX } from 'lucide-react';

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
  root: {
    fontFamily: "'Instrument Sans', sans-serif",
    color: '#0f0f0f',
    background: '#fff',
    minHeight: '100vh',
  },

  /* ── PAGE HEADER ── */
  pageHeader: {
    borderBottom: '1px solid #f0f0f0',
    padding: '48px 24px 32px',
  },
  pageHeaderInner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
    flexWrap: 'wrap',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 8,
  },
  pageH1: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 'clamp(28px, 3vw, 40px)',
    fontWeight: 400,
    margin: '0 0 6px',
    lineHeight: 1.1,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#888',
    margin: 0,
  },

  /* sort dropdown */
  sortWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  sortSelect: {
    fontFamily: "'Instrument Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: '#0f0f0f',
    background: '#f7f7f5',
    border: '1px solid #e8e8e8',
    borderRadius: 40,
    padding: '8px 16px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    paddingRight: 32,
  },
  sortSelectWrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  sortChevron: {
    position: 'absolute',
    right: 10,
    pointerEvents: 'none',
    color: '#888',
  },

  /* ── BODY ── */
  body: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 24px 80px',
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: 48,
    alignItems: 'start',
  },

  /* ── SIDEBAR ── */
  sidebar: {
    position: 'sticky',
    top: 88,
  },
  sidebarHead: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 16,
  },
  catList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  catBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '9px 12px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Instrument Sans', sans-serif",
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s',
    background: 'transparent',
    color: '#555',
  },
  catBtnActive: {
    background: '#0f0f0f',
    color: '#fff',
  },

  /* ── PRODUCT AREA ── */
  prodArea: {},
  prodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    marginBottom: 40,
  },

  /* ── PAGINATION ── */
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 32,
    borderTop: '1px solid #f0f0f0',
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1px solid #e8e8e8',
    background: '#fff',
    color: '#555',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Instrument Sans', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.12s, border-color 0.12s, color 0.12s',
  },
  pageBtnActive: {
    background: '#0f0f0f',
    color: '#fff',
    border: '1px solid #0f0f0f',
  },
  pageBtnDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },

  /* ── EMPTY STATE ── */
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    border: '1px dashed #e0e0e0',
    borderRadius: 20,
    textAlign: 'center',
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: '#f7f7f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyH3: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22,
    fontWeight: 400,
    margin: '0 0 8px',
  },
  emptyP: {
    fontSize: 13,
    color: '#888',
    margin: 0,
  },
};

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSortBy = searchParams.get('sortBy') || 'id';
  const currentSortDir = searchParams.get('sortDir') || 'desc';

  useEffect(() => { injectFonts(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        let query = `/products?page=${currentPage}&size=9&sortBy=${currentSortBy}&sortDir=${currentSortDir}`;
        if (currentCategory) query += `&category=${currentCategory}`;
        if (currentSearch) query += `&search=${encodeURIComponent(currentSearch)}`;
        const res = await api.get(query);
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } catch (e) {
        console.error(e);
        setToast({ message: 'Failed to fetch products. Try reloading.', type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, currentCategory, currentSearch, currentSortBy, currentSortDir]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.set('page', '0');
    setSearchParams(p);
  };

  const handleCategoryChange = catId => setParam('category', catId);

  const handleSortChange = e => {
    const [sortBy, sortDir] = e.target.value.split(',');
    const p = new URLSearchParams(searchParams);
    p.set('sortBy', sortBy);
    p.set('sortDir', sortDir);
    p.set('page', '0');
    setSearchParams(p);
  };

  const handlePageChange = page => {
    if (page < 0 || page >= totalPages) return;
    const p = new URLSearchParams(searchParams);
    p.set('page', page.toString());
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={s.root}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── PAGE HEADER ── */}
      <div style={s.pageHeader}>
        <div style={s.pageHeaderInner}>
          <div>
            <p style={s.eyebrow}>Krato Store</p>
            <h1 style={s.pageH1}>
              {currentSearch ? `Results for "${currentSearch}"` : 'All Products'}
            </h1>
            <p style={s.pageSubtitle}>
              {totalElements > 0
                ? `${totalElements} item${totalElements !== 1 ? 's' : ''} available`
                : 'Explore our collection'}
            </p>
          </div>

          {/* Sort */}
          <div style={s.sortWrap}>
            <SlidersHorizontal size={14} color="#888" />
            <div style={s.sortSelectWrap}>
              <select
                value={`${currentSortBy},${currentSortDir}`}
                onChange={handleSortChange}
                style={s.sortSelect}
              >
                <option value="id,desc">Newest first</option>
                <option value="price,asc">Price: low to high</option>
                <option value="price,desc">Price: high to low</option>
                <option value="name,asc">A → Z</option>
              </select>
              <ChevronRight size={12} style={{ ...s.sortChevron, transform: 'rotate(90deg)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={s.body}>

        {/* Sidebar */}
        <aside style={s.sidebar}>
          <p style={s.sidebarHead}>Category</p>
          <div style={s.catList}>
            {[{ id: '', name: 'All products' }, ...categories].map(cat => {
              const active = currentCategory === (cat.id ? cat.id.toString() : '');
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id ? cat.id.toString() : '')}
                  style={{
                    ...s.catBtn,
                    ...(active ? s.catBtnActive : {}),
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = '#f7f7f5';
                      e.currentTarget.style.color = '#0f0f0f';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#555';
                    }
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Products */}
        <div style={s.prodArea}>
          {loading ? (
            <LoadingSpinner />
          ) : products.length > 0 ? (
            <>
              <div style={s.prodGrid}>
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onToast={msg => setToast(msg)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={s.pagination}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    style={{
                      ...s.pageBtn,
                      ...(currentPage === 0 ? s.pageBtnDisabled : {}),
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      style={{
                        ...s.pageBtn,
                        ...(currentPage === i ? s.pageBtnActive : {}),
                      }}
                      onMouseEnter={e => {
                        if (currentPage !== i) {
                          e.currentTarget.style.background = '#f7f7f5';
                          e.currentTarget.style.borderColor = '#ccc';
                        }
                      }}
                      onMouseLeave={e => {
                        if (currentPage !== i) {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.borderColor = '#e8e8e8';
                        }
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    style={{
                      ...s.pageBtn,
                      ...(currentPage === totalPages - 1 ? s.pageBtnDisabled : {}),
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={s.empty}>
              <div style={s.emptyIconWrap}>
                <SearchX size={20} color="#888" />
              </div>
              <h3 style={s.emptyH3}>No products found</h3>
              <p style={s.emptyP}>
                Try resetting your filters or selecting another category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;