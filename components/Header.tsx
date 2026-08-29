import * as React from 'react';
import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { AWC_VAULT_LOGIN_URL, AWC_CONNECT_URL } from '../src/constants';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const logoUrl = "/images/logo.png";

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const mobileLinkClass =
    'text-[12px] font-semibold uppercase tracking-[0.16em] text-center py-2.5 text-white/85 hover:text-church-gold';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
      isActive ? 'text-church-gold' : 'text-white/80 hover:text-white'
    }`;

  const utilityClass =
    'whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 hover:text-white transition-colors';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHome && !isScrolled ? 'bg-transparent' : 'bg-church-burgundy/95 backdrop-blur-md shadow-lg'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-4">
          <div className="hidden lg:flex items-center justify-end gap-7 flex-1 min-w-0">
            {leftNavItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <Link to="/" className="shrink-0 z-50" aria-label="Anointed Worship Center home">
            <div className="w-[68px] h-[68px] bg-white rounded-full flex items-center justify-center border-2 border-church-gold/30 shadow-md p-1.5">
              <img src={logoUrl} className="w-full h-full object-contain" alt="" />
            </div>
          </Link>

          <div className="hidden lg:flex items-center justify-start gap-7 flex-1 min-w-0">
            <div className="flex items-center gap-7">
              {rightNavItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>

            <span className="h-4 w-px bg-white/20 shrink-0" aria-hidden="true" />

            <div className="flex items-center gap-5 shrink-0">
              <a
                href={AWC_VAULT_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="AWC Vault — staff and church operations sign-in"
                className={utilityClass}
              >
                AWC Vault
              </a>
              <a
                href={AWC_CONNECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="AWC Connect — church app for members"
                className={utilityClass}
              >
                AWC Connect
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white text-2xl"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      <div className={`lg:hidden bg-church-burgundy border-t border-white/10 ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col px-6 py-5 max-h-[calc(100dvh-72px)] overflow-y-auto">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={mobileLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="my-3 h-px bg-white/10" />
          <a
            href={AWC_VAULT_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className={mobileLinkClass}
          >
            AWC Vault
          </a>
          <a
            href={AWC_CONNECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className={mobileLinkClass}
          >
            AWC Connect
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
