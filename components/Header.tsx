import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const logoUrl = "https://anointedworshipcenter.com/logo.png";

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/ministries', label: 'Ministries' },
    { path: '/sermons', label: 'Sermons' },
    { path: '/events', label: 'Events' },
    { path: '/community', label: 'Community' },
    { path: '/connect', label: 'Connect' },
  ];

  const leftNavItems = navItems.slice(0, 3);
  const rightNavItems = navItems.slice(3);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-church-burgundy text-white py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* PC Navigation Left */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-end pr-12">
            {leftNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isActive ? 'text-church-gold' : 'text-gray-300 hover:text-white'}`
                }
              >
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

          {/* PC Navigation Right */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-start pl-12">
            {rightNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isActive ? 'text-church-gold' : 'text-gray-300 hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => navigate('/visit')}
              className="bg-church-gold text-white px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-church-burgundy transition-all ml-4"
            >
              Visit Us
            </button>
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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-bold uppercase tracking-widest text-center py-2"
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Header;
