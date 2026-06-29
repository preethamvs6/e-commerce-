import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

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
  footer: {
    fontFamily: "'Instrument Sans', sans-serif",
    background: '#0f0f0f',
    color: '#888',
    borderTop: '1px solid #1a1a1a',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '64px 24px 0',
  },

  /* top row */
  topRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: 48,
    paddingBottom: 56,
    borderBottom: '1px solid #1e1e1e',
  },

  /* brand col */
  brandLogo: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28,
    fontWeight: 400,
    color: '#fff',
    textDecoration: 'none',
    letterSpacing: '-0.01em',
    display: 'block',
    marginBottom: 16,
  },
  brandDot: { color: '#555' },
  brandDesc: {
    fontSize: 13,
    lineHeight: 1.75,
    color: '#555',
    maxWidth: 280,
    margin: '0 0 28px',
  },
  techPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    padding: '4px 10px',
    borderRadius: 20,
    border: '1px solid #2a2a2a',
    color: '#555',
  },

  /* link columns */
  colHead: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#fff',
    marginBottom: 20,
  },
  colList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  colItem: {
    fontSize: 13,
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  colLink: {
    fontSize: 13,
    color: '#555',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    transition: 'color 0.15s',
  },

  /* bottom bar */
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
  },
  copyright: {
    fontSize: 12,
    color: '#3a3a3a',
  },
  bottomLinks: {
    display: 'flex',
    gap: 24,
  },
  bottomLink: {
    fontSize: 12,
    color: '#3a3a3a',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
};

const ColLink = ({ href, to, children }) => {
  const style = s.colLink;
  const hover = e => { e.currentTarget.style.color = '#ccc'; };
  const leave = e => { e.currentTarget.style.color = '#555'; };

  if (to) {
    return (
      <Link to={to} style={style} onMouseEnter={hover} onMouseLeave={leave}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={style} onMouseEnter={hover} onMouseLeave={leave}>
      {children} <ArrowUpRight size={11} />
    </a>
  );
};

const Footer = () => {
  React.useEffect(() => { injectFonts(); }, []);

  const techPills = [
    'React', 'Spring Boot', 'Docker', 'Kubernetes', 'AWS', 'MySQL',
  ];

  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.topRow}>

          {/* Brand */}
          <div>
            <Link to="/" style={s.brandLogo}>
              Krato<span style={s.brandDot}>.</span>
            </Link>
            <p style={s.brandDesc}>
              A production-grade e-commerce platform built with React,
              Spring Boot microservices, Docker, Kubernetes, and GitHub
              Actions CI/CD. Crafted as a developer portfolio project.
            </p>
            <div style={s.techPills}>
              {techPills.map(t => (
                <span key={t} style={s.pill}>{t}</span>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p style={s.colHead}>Shop</p>
            <ul style={s.colList}>
              {[
                { label: 'All Products', to: '/products' },
                { label: 'Electronics', to: '/category/1' },
                { label: 'Fashion', to: '/category/2' },
                { label: 'Home & Kitchen', to: '/category/3' },
                { label: 'Books', to: '/category/4' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <ColLink to={to}>{label}</ColLink>
                </li>
              ))}
            </ul>
          </div>

          {/* DevOps */}
          <div>
            <p style={s.colHead}>DevOps Stack</p>
            <ul style={s.colList}>
              {[
                'GitHub Actions CI/CD',
                'Docker & Compose',
                'Kubernetes (EKS)',
                'AWS EC2 & RDS',
                'Nginx Reverse Proxy',
              ].map(item => (
                <li key={item} style={s.colItem}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p style={s.colHead}>Portfolio</p>
            <ul style={s.colList}>
              <li>
                <ColLink href="https://github.com/portfolio">
                  GitHub
                </ColLink>
              </li>
              <li>
                <ColLink href="https://linkedin.com/in/portfolio">
                  LinkedIn
                </ColLink>
              </li>
              <li>
                <ColLink href="mailto:developer@portfolio.com">
                  developer@portfolio.com
                </ColLink>
              </li>
              <li style={s.colItem}>Remote / Worldwide</li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={s.bottomBar}>
          <p style={s.copyright}>
            © {new Date().getFullYear()} Krato. Built for developer portfolio.
          </p>
          <div style={s.bottomLinks}>
            {['Privacy', 'Terms', 'Contact'].map(label => (
              <a
                key={label}
                href="#"
                style={s.bottomLink}
                onMouseEnter={e => { e.currentTarget.style.color = '#888'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#3a3a3a'; }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;