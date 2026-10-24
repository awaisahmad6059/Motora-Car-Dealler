import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  FiArrowUpRight,
  FiClock,
  FiMapPin,
  FiMenu,
  FiPhone,
  FiX,
} from 'react-icons/fi';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Home', exact: true },
  { to: '/cars', label: 'Cars' },
  { to: '/cars?condition=New', label: 'New Arrivals', query: 'New' },
  { to: '/cars?condition=Used', label: 'Used Cars', query: 'Used' },
  { to: '/finance', label: 'Finance' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const condition = new URLSearchParams(location.search).get('condition');

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    if (link.to === '/cars') {
      return location.pathname === '/cars' && !['New', 'Used'].includes(condition);
    }
    if (link.query) {
      return location.pathname === '/cars' && condition === link.query;
    }
    return location.pathname === link.to;
  };

  return (
    <header className="sticky top-0 z-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      <div className="border-b border-white/[0.06] bg-[#08080b] px-4 py-2 text-[11px] text-white/50 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            <span>
              <span className="font-semibold text-white/80">Demo mode</span>
              <span className="hidden sm:inline"> — all bookings &amp; payments are simulated</span>
            </span>
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="/track"
              className="hidden items-center gap-1.5 transition-colors hover:text-white sm:flex"
            >
              <FiMapPin size={11} />
              Track Booking
            </Link>
            <a href="tel:+924211122233" className="flex items-center gap-1.5 transition-colors hover:text-white">
              <FiPhone size={11} />
              <span className="hidden xs:inline">+92 42 111 222 33</span>
              <span className="xs:hidden">Call us</span>
            </a>
          </div>
        </div>
      </div>

      <div
        className={`border-b border-white/[0.07] bg-ink/[0.97] backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)]' : ''
        }`}
      >
        <nav className="container-page flex h-[74px] items-center justify-between" aria-label="Main navigation">
          <Logo light onClick={() => setOpen(false)} />

          <ul className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <li key={link.label}>
                <NavLink
                  to={link.to}
                  end={link.exact}
                  className={`group relative py-2 text-[13px] font-medium transition-colors ${
                    isActive(link) ? 'text-white' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-[2px] origin-left rounded-full bg-racing transition-transform duration-300 ${
                      isActive(link) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/track" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/55 transition hover:border-white/30 hover:text-white" aria-label="Track a booking">
              <FiClock size={16} />
            </Link>
            <Link to="/cars" className="btn-primary btn-sm pl-5 pr-4">
              Book Now
              <FiArrowUpRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 text-white transition hover:bg-white/10 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <FiX size={21} /> : <FiMenu size={21} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-[104px] z-40 cursor-default bg-ink/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-104px)] overflow-y-auto border-b border-white/10 bg-ink lg:hidden"
            >
              <div className="container-page flex flex-col py-6">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                  Explore Motora
                </p>
                {links.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index }}
                  >
                    <Link
                      to={link.to}
                      className={`flex items-center justify-between border-b border-white/[0.06] py-4 font-display text-lg font-semibold ${
                        isActive(link) ? 'text-white' : 'text-white/60'
                      }`}
                    >
                      {link.label}
                      {isActive(link) && <span className="h-1.5 w-1.5 rounded-full bg-racing" />}
                    </Link>
                  </motion.div>
                ))}
                <Link to="/track" className="flex items-center justify-between border-b border-white/[0.06] py-4 font-display text-lg font-semibold text-white/60">
                  Track Booking
                  <FiArrowUpRight className="text-white/30" />
                </Link>
                <div className="mt-6 flex items-center gap-3">
                  <Link to="/cars" className="btn-primary flex-1">
                    Book Now
                  </Link>
                  <a href="tel:+924211122233" className="btn-ghost flex-1">
                    <FiPhone size={15} /> Call Us
                  </a>
                </div>
                <p className="mt-5 text-center text-[11px] text-white/30">
                  Demo website — no real bookings or payments are processed.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
