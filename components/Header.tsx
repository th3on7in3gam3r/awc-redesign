import * as React from 'react';
import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../src/context/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const logoUrl = "/images/logo.png";

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${isHome && !isScrolled ? 'bg-transparent' : 'bg-church-burgundy shadow-lg'
    }`;

  // Desktop primary links (balanced 3 + 3). Gallery stays mobile-only in the bar.
  const leftNavItems = [
    { path: '/', label: 'Home' },
    { path: '/ministries', label: 'Ministries' },
    { path: '/sermons', label: 'Sermons' },
  ];

  const rightNavItems = [
    { path: '/events', label: 'Events' },
    { path: '/store', label: 'Store' },
    { path: '/community', label: 'Community' },
  ];

  const mobileNavItems = [
    ...leftNavItems,
    { path: '/gallery', label: 'Gallery' },
    ...rightNavItems,
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isActive ? 'text-church-gold' : 'text-gray-300 hover:text-white'}`;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* PC Navigation Left */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-end pr-10">
            {leftNavItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 z-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-church-gold/20 shadow-xl p-2 relative translate-y-2">
              <img src={logoUrl} className="w-full h-full object-contain" alt="AWC Logo" />
            </div>
          </Link>

          {/* PC Navigation Right + action cluster */}
          <div className="hidden md:flex items-center flex-1 justify-start pl-10 gap-8">
            <div className="flex items-center space-x-6">
              {rightNavItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://awc-vault.vercel.app/#/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 hover:text-white transition-colors"
              >
                Members
              </a>
              <Link
                to="/store/cart"
                className="relative text-gray-300 hover:text-white transition-colors p-1"
                aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
              >
                <i className="fa-solid fa-bag-shopping text-sm" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[1.1rem] h-[1.1rem] px-1 bg-church-gold text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => navigate('/visit')}
                className="bg-church-gold text-white px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-church-burgundy transition-all"
              >
                Visit Us
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white text-2xl"
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`md:hidden bg-church-burgundy absolute top-full left-0 right-0 transition-all ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col p-6 space-y-4">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-bold uppercase tracking-widest text-center py-2 text-white hover:text-church-gold"
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/store/cart"
            onClick={() => setIsMenuOpen(false)}
            className="text-xs font-bold uppercase tracking-widest text-center py-2 text-white hover:text-church-gold"
          >
            Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </Link>
          <a
            href="https://awc-vault.vercel.app/#/login"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="text-xs font-bold uppercase tracking-widest text-center py-2 text-white hover:text-church-gold"
          >
            Members
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
