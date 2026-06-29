import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, Truck, ShieldCheck,
  Clock, RotateCcw, Sparkles, TrendingUp, ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

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

// Inject keyframes once
const injectKeyframes = () => {
  if (document.getElementById('home-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'home-keyframes';
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg) } }

    @keyframes showcaseIn {
      from { opacity: 0; transform: translateY(18px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1);    }
    }
    @keyframes showcaseOut {
      from { opacity: 1; transform: translateY(0)    scale(1);    }
      to   { opacity: 0; transform: translateY(-18px) scale(0.97); }
    }
    .showcase-enter { animation: showcaseIn  0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
    .showcase-exit  { animation: showcaseOut 0.35s cubic-bezier(0.55,0,1,0.45)  forwards; }

    @keyframes dotPulse {
      0%,100% { transform: scale(1);   opacity: 0.5; }
      50%      { transform: scale(1.4); opacity: 1;   }
    }
  `;
  document.head.appendChild(style);
};

const categoryImages = {
  Electronics: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',
  Fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
  Books: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600',
};

const featureCards = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders over ₹500' },
  { icon: ShieldCheck, label: 'Secure Payment', sub: '100% secure checkout' },
  { icon: Clock, label: '24 / 7 Support', sub: 'Dedicated service team' },
  { icon: RotateCcw, label: 'Easy Returns', sub: '30-day money-back guarantee' },
];

const FALLBACK_SHOWCASES = [
  {
    id: 1,
    name: 'boAt Airdopes 141',
    description: 'Pure immersive sound · 42 hr playback',
    price: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
  },
  {
    id: 2,
    name: 'Apple Watch SE',
    description: 'Stay connected · All-day battery',
    price: 24999,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation',
    price: 19999,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
  },
];

/* ── styles ── */
const s = {
  root: { fontFamily: "'Instrument Sans', sans-serif", color: '#0f0f0f', background: '#ffffff' },
  hero: { position: 'relative', overflow: 'hidden', background: '#0f0f0f', padding: '100px 24px 80px' },
  heroInner: { maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' },
  heroTag: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 24 },
  heroH1: { fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(42px, 5vw, 72px)', lineHeight: 1.05, color: '#ffffff', margin: '0 0 24px', fontWeight: 400 },
  heroItalic: { fontStyle: 'italic', color: '#d4d0c8' },
  heroP: { fontSize: 16, lineHeight: 1.75, color: '#888', maxWidth: 440, margin: '0 0 40px' },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#ffffff', color: '#0f0f0f', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600, fontSize: 14, borderRadius: 40, border: 'none', cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s, transform 0.15s' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'transparent', color: '#888', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, fontSize: 14, borderRadius: 40, border: '1px solid #2a2a2a', cursor: 'pointer', textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s' },
  showcaseWrap: { position: 'relative' },
  showcaseCard: { background: '#1a1a1a', borderRadius: 24, padding: 20, border: '1px solid #2a2a2a', overflow: 'hidden' },
  showcaseImgWrap: { position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 14, overflow: 'hidden', background: '#111' },
  showcaseImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14, display: 'block' },
  showcaseMeta: { padding: '16px 4px 4px' },
  showcaseName: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#fff', margin: '0 0 4px', fontWeight: 400 },
  showcaseSub: { fontSize: 13, color: '#666', margin: '0 0 14px' },
  showcaseRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  showcasePrice: { fontSize: 22, fontWeight: 700, color: '#fff' },
  showcaseLink: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#888', textDecoration: 'none', letterSpacing: '0.05em' },
  badge: { position: 'absolute', top: 32, left: 32, background: '#fff', color: '#0f0f0f', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 20 },
  dotsRow: { display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.3s, transform 0.3s' },
  trust: { borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '32px 24px' },
  trustInner: { maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 },
  trustItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '0 32px', borderRight: '1px solid #f0f0f0' },
  trustIconWrap: { flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  trustLabel: { fontSize: 13, fontWeight: 600, margin: '0 0 2px' },
  trustSub: { fontSize: 12, color: '#888', margin: 0 },
  section: { maxWidth: 1200, margin: '0 auto', padding: '80px 24px' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 },
  sectionEyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  sectionH2: { fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 400, margin: 0, lineHeight: 1.15 },
  seeAll: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#0f0f0f', textDecoration: 'none', borderBottom: '1px solid #0f0f0f', paddingBottom: 1 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  catCard: { position: 'relative', borderRadius: 20, overflow: 'hidden', height: 280, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textDecoration: 'none', background: '#111' },
  catImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, transition: 'opacity 0.4s, transform 0.5s' },
  catOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' },
  catContent: { position: 'relative', zIndex: 1, padding: '20px 20px 22px' },
  catName: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#fff', fontWeight: 400, margin: '0 0 4px' },
  catDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 },
  catArrow: { position: 'absolute', top: 18, right: 18, zIndex: 1, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background 0.2s, transform 0.2s' },
  prodGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 },
  divider: { height: 1, background: '#f0f0f0', maxWidth: 1200, margin: '0 auto' },
  banner: { background: '#0f0f0f', borderRadius: 24, padding: '64px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' },
  bannerEyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666', marginBottom: 12 },
  bannerH2: { fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px, 3vw, 42px)', color: '#fff', fontWeight: 400, margin: '0 0 16px', lineHeight: 1.1 },
  bannerP: { fontSize: 15, color: '#666', maxWidth: 380, margin: 0, lineHeight: 1.7 },
};

/* ── Showcase carousel ── */
const ShowcaseCard = ({ items }) => {
  const [index, setIndex] = useState(0);
  const [animClass, setAnimClass] = useState('showcase-enter');
  const timerRef = useRef(null);

  const goTo = (next) => {
    setAnimClass('showcase-exit');
    setTimeout(() => {
      setIndex(next);
      setAnimClass('showcase-enter');
    }, 350);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % items.length;
        goTo(next);
        return prev; // goTo handles the update
      });
    }, 3500);
  };

  useEffect(() => {
    if (items.length <= 1) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  const handleDot = (i) => {
    clearInterval(timerRef.current);
    goTo(i);
    startTimer();
  };

  const item = items[index];
  if (!item) return null;

  return (
    <div style={s.showcaseWrap}>
      <span style={s.badge}>🔥 Trending</span>
      <div style={s.showcaseCard}>
        <div style={s.showcaseImgWrap}>
          <img
            key={item.id}
            src={item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
            alt={item.name}
            style={s.showcaseImg}
            className={animClass}
          />
        </div>
        <div style={s.showcaseMeta} className={animClass}>
          <h4 style={s.showcaseName}>{item.name}</h4>
          <p style={s.showcaseSub}>{item.description || 'Premium quality product'}</p>
          <div style={s.showcaseRow}>
            <span style={s.showcasePrice}>₹{Number(item.price).toLocaleString('en-IN')}</span>
            <Link to={`/products/${item.id}`} style={s.showcaseLink}>
              View detail <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* dots */}
        {items.length > 1 && (
          <div style={s.dotsRow}>
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDot(i)}
                style={{
                  ...s.dot,
                  background: i === index ? '#fff' : '#444',
                  transform: i === index ? 'scale(1.3)' : 'scale(1)',
                }}
                aria-label={`Go to product ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── main component ── */
const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showcaseItems, setShowcaseItems] = useState(FALLBACK_SHOWCASES);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { injectFonts(); injectKeyframes(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?size=8'),
        ]);
        setCategories(catRes.data);
        const products = prodRes.data.content || [];
        setFeaturedProducts(products.slice(0, 4));
        if (products.length > 0) setShowcaseItems(products.slice(0, 5));
      } catch (err) {
        console.error(err);
        setToast({ message: 'Failed to load shop items. Please refresh.', type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={s.root}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          {/* left */}
          <div>
            <p style={s.heroTag}><Sparkles size={12} /> India's Premium Tech &amp; Style Hub</p>
            <h1 style={s.heroH1}>
              Shop what<br />
              <span style={s.heroItalic}>moves you.</span>
            </h1>
            <p style={s.heroP}>
              Curated electronics, fashion &amp; lifestyle products—delivered
              fast across India. Quality you can trust, prices you'll love.
            </p>
            <div style={s.heroBtns}>
              <Link
                to="/products" style={s.btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
              >
                <ShoppingBag size={16} /> Shop Now <ArrowRight size={15} />
              </Link>
              <a
                href="#featured" style={s.btnSecondary}
                onMouseEnter={e => { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.borderColor = '#555'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
              >
                Latest launches
              </a>
            </div>
          </div>

          {/* right — animated showcase */}
          <ShowcaseCard items={showcaseItems} />
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div style={s.trust}>
        <div style={s.trustInner}>
          {featureCards.map(({ icon: Icon, label, sub }, i) => (
            <div key={i} style={{ ...s.trustItem, paddingLeft: i === 0 ? 0 : undefined, borderRight: i === featureCards.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
              <div style={s.trustIconWrap}><Icon size={18} color="#0f0f0f" /></div>
              <div>
                <p style={s.trustLabel}>{label}</p>
                <p style={s.trustSub}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div style={s.section}>
        <div style={s.sectionHead}>
          <div>
            <p style={s.sectionEyebrow}><TrendingUp size={12} /> Departments</p>
            <h2 style={s.sectionH2}>Browse by category</h2>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 32, height: 32, border: '2px solid #e0e0e0', borderTopColor: '#0f0f0f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <div style={s.catGrid}>
            {categories.map(cat => (
              <Link
                key={cat.id} to={`/category/${cat.id}`} style={s.catCard}
                onMouseEnter={e => {
                  e.currentTarget.querySelector('img').style.opacity = '0.7';
                  e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
                  e.currentTarget.querySelector('.cat-arrow').style.background = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.querySelector('img').style.opacity = '0.55';
                  e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                  e.currentTarget.querySelector('.cat-arrow').style.background = 'rgba(255,255,255,0.15)';
                }}
              >
                <img src={categoryImages[cat.name] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600'} alt={cat.name} style={s.catImg} />
                <div style={s.catOverlay} />
                <div className="cat-arrow" style={s.catArrow}><ArrowUpRight size={14} color="#fff" /></div>
                <div style={s.catContent}>
                  <h3 style={s.catName}>{cat.name}</h3>
                  <p style={s.catDesc}>{cat.description || 'Explore collection'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={s.divider} />

      {/* ── FEATURED PRODUCTS ── */}
      <div id="featured" style={s.section}>
        <div style={s.sectionHead}>
          <div>
            <p style={s.sectionEyebrow}><Sparkles size={12} /> New arrivals</p>
            <h2 style={s.sectionH2}>Trending right now</h2>
          </div>
          <Link to="/products" style={s.seeAll}>See all <ArrowRight size={13} /></Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : featuredProducts.length > 0 ? (
          <div style={s.prodGrid}>
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} onToast={msg => setToast(msg)} />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#888', padding: '48px 0' }}>
            No products found. Seed your database to get started.
          </p>
        )}
      </div>

      {/* ── BOTTOM BANNER ── */}
      <div style={{ padding: '0 24px 80px' }}>
        <div style={s.banner}>
          <div>
            <p style={s.bannerEyebrow}>Limited time offer</p>
            <h2 style={s.bannerH2}>Get 20% off<br />your first order.</h2>
            <p style={s.bannerP}>Sign up today and unlock exclusive deals on electronics, fashion, and more—delivered fast, every time.</p>
          </div>
          <Link
            to="/register"
            style={{ ...s.btnPrimary, flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
          >
            Create account <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;