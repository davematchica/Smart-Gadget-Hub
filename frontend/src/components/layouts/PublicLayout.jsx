import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-lg py-3 md:py-4'
            : 'bg-transparent py-4 md:py-5'
        }`}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="relative">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary-600 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-display font-bold gradient-text leading-tight truncate">
                  Smart GadgetHub
                </h1>
                <p className="text-[9px] md:text-[10px] text-neutral-500 font-medium">by Ann Montenegro</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-semibold transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-neutral-700 hover:text-primary-600'
                  }`}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-500"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Button - Desktop & Tablet */}
            <Link
              to="/contact"
              className="hidden md:flex items-center gap-2 btn-primary text-sm lg:text-base px-4 lg:px-6"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">Inquire Now</span>
              <span className="lg:hidden">Inquire</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:lg:hidden p-2 rounded-xl hover:bg-neutral-100 transition-colors active:scale-95"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold gradient-text">Menu</h2>
                      <p className="text-xs text-neutral-500">Navigate</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-2 mb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center px-4 py-3.5 rounded-xl font-semibold transition-all ${
                        location.pathname === link.path
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {link.label}
                      {location.pathname === link.path && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </Link>
                  ))}
                </div>

                {/* CTA Button */}
                <Link 
                  to="/contact" 
                  className="btn-primary text-center w-full flex items-center justify-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Phone className="w-4 h-4" />
                  Inquire Now
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white mt-20">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary-400" />
                <h3 className="text-xl font-display font-bold">Smart GadgetHub</h3>
              </div>
              <p className="text-neutral-400 mb-4 text-sm leading-relaxed">
                Your trusted source for premium gadgets and devices. Curated by Ann Montenegro.
              </p>
              <p className="text-xs text-neutral-500">
                DTI Registered Business
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-neutral-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Contact</h4>
              <div className="flex flex-col gap-2 text-neutral-400 text-sm">
                <a href="mailto:contact@smartgadgethub.com" className="hover:text-primary-400 transition-colors break-all">
                  contact@smartgadgethub.com
                </a>
                <a href="tel:+63" className="hover:text-primary-400 transition-colors">
                  +63 XXX XXX XXXX
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-xs sm:text-sm text-neutral-500">
            <p>&copy; {new Date().getFullYear()} Smart GadgetHub by Ann Montenegro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}