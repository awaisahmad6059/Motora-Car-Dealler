import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiCalendar,
  FiExternalLink,
  FiGrid,
  FiLogOut,
  FiMail,
  FiRefreshCw,
  FiTruck,
  FiX,
  FiMenu,
  FiDatabase,
} from 'react-icons/fi';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import {
  DEMO_ADMIN,
  getStats,
  logoutAdmin,
  resetDemoData,
} from '../services/api';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/cars', label: 'Manage Cars', icon: FiTruck },
  { to: '/admin/bookings', label: 'Bookings', icon: FiCalendar },
  { to: '/admin/enquiries', label: 'Enquiries', icon: FiMail },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newEnquiries, setNewEnquiries] = useState(0);

  const loadCount = () => {
    getStats()
      .then((stats) => setNewEnquiries(stats.newEnquiries))
      .catch(() => {});
  };

  useEffect(() => {
    loadCount();
    const onReset = () => loadCount();
    window.addEventListener('motora:data-reset', onReset);
    return () => window.removeEventListener('motora:data-reset', onReset);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemoData();
      setResetOpen(false);
      setMobileOpen(false);
      loadCount();
      window.dispatchEvent(new CustomEvent('motora:data-reset'));
      showToast('Demo data restored to its original state.');
    } catch {
      showToast('Could not reset demo data. Please try again.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Logo light onClick={() => setMobileOpen(false)} />
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.08] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-gold">Demo admin</span>
        </div>
      </div>

      <div className="mx-5 h-px bg-white/[0.07]" />

      <nav className="flex-1 px-3 py-5" aria-label="Admin navigation">
        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Control room</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/45 hover:bg-white/[0.04] hover:text-white/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`grid h-8 w-8 place-items-center rounded-lg transition ${isActive ? 'bg-racing text-white' : 'bg-white/[0.04] text-white/40 group-hover:text-white/70'}`}>
                        <Icon size={14} />
                      </span>
                      <span>{item.label}</span>
                      {item.label === 'Enquiries' && newEnquiries > 0 && (
                        <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-racing px-1.5 text-[9px] font-bold text-white">
                          {newEnquiries}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="my-5 h-px bg-white/[0.07]" />
        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Shortcuts</p>
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.04] hover:text-white/80"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-white/40">
            <FiExternalLink size={14} />
          </span>
          View website
        </Link>
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-white/45 transition hover:bg-white/[0.04] hover:text-white/80"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-white/40">
            <FiDatabase size={14} />
          </span>
          Reset demo data
        </button>
      </nav>

      <div className="border-t border-white/[0.07] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-racing text-[10px] font-bold text-white">AD</span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-white/80">Demo Admin</p>
            <p className="truncate text-[9px] text-white/30">{DEMO_ADMIN.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 transition hover:border-racing/50 hover:bg-racing/10 hover:text-white"
        >
          <FiLogOut size={13} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-white/[0.06] bg-ink lg:block">
        {sidebarContent}
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-ink/[0.07] bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink/60 lg:hidden"
              aria-label="Open admin menu"
            >
              <FiMenu size={19} />
            </button>
            <div className="hidden lg:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/30">Motora demo control room</p>
              <p className="mt-0.5 text-xs font-medium text-ink/55">Manage inventory, bookings and enquiries</p>
            </div>
            <div className="lg:hidden">
              <Logo light={false} onClick={() => setMobileOpen(false)} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Local demo
              </span>
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink/40 transition hover:border-ink/30 hover:text-ink"
                aria-label="Open public website"
              >
                <FiExternalLink size={15} />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-white transition hover:bg-racing sm:flex"
              >
                <FiLogOut size={12} /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close admin menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] cursor-default bg-ink/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[70] w-[286px] max-w-[86vw] bg-ink shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50"
                aria-label="Close menu"
              >
                <FiX size={16} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo data?"
        subtitle="Restore the original cars, bookings and enquiries."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setResetOpen(false)} className="btn-outline btn-sm">
              Cancel
            </button>
            <button type="button" onClick={handleReset} disabled={resetting} className="btn-primary btn-sm">
              {resetting ? (
                <><FiRefreshCw className="animate-spin" size={13} /> Resetting…</>
              ) : (
                <><FiRefreshCw size={13} /> Reset data</>
              )}
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/[0.06] px-4 py-3.5">
          <FiAlertTriangle size={18} className="mt-0.5 shrink-0 text-gold" />
          <div className="text-xs leading-relaxed text-ink/60">
            <p className="font-semibold text-ink">This cannot be undone.</p>
            <p className="mt-1">
              Any cars you added or edited, bookings made, and enquiries submitted will be
              replaced with the original demo JSON data. You will stay logged in.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
