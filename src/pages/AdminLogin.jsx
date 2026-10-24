import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiLock,
  FiMail,
  FiShield,
} from 'react-icons/fi';
import Logo from '../components/Logo';
import PageMeta from '../components/PageMeta';
import {
  DEMO_ADMIN,
  adminLogin,
  isAdminAuthenticated,
} from '../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated()) navigate('/admin', { replace: true });
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        const from = location.state?.from;
        navigate(from && from.startsWith('/admin') ? from : '/admin', { replace: true });
      } else {
        setError(result.message);
      }
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setError('');
  };

  return (
    <>
      <PageMeta
        title="Demo Admin Login"
        description="Sign in to the Motora Car Dealers demo admin panel with the provided demo credentials."
      />
      <div className="flex min-h-screen bg-white">
        <div className="relative hidden w-[46%] overflow-hidden bg-ink lg:block">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/80 to-ink/30" />
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <Logo light />
            <div className="max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/60 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Demo control room
              </span>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-5xl">
                Manage the showroom,
                <span className="text-white/40"> beautifully.</span>
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-white/45">
                Add cars, manage demo bookings and review enquiries. Everything is stored
                locally in this browser — no backend required.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="font-display text-2xl font-extrabold text-white">12</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/30">Cars in demo inventory</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold text-white">100%</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/30">Local data persistence</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-white/25">
              Motora Car Dealers · Demo administration
            </p>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-ink/[0.06] px-5 py-5 sm:px-8 lg:border-0 lg:px-10 lg:py-7">
            <div className="lg:hidden">
              <Logo light={false} />
            </div>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink/50 transition hover:border-ink hover:text-ink"
            >
              <FiArrowLeft size={12} /> Back to website
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-racing" />
                Admin access
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Welcome back.</h2>
              <p className="mt-2 text-sm text-ink/50">Sign in to manage the Motora demo showroom.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="admin-email" className="input-label">Email address</label>
                  <div className="relative">
                    <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" size={15} />
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(event) => { setEmail(event.target.value); setError(''); }}
                      placeholder="admin@motora.demo"
                      className="input-field pl-11"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="admin-password" className="input-label">Password</label>
                    <span className="mb-2 text-[10px] text-ink/30">Demo only</span>
                  </div>
                  <div className="relative">
                    <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" size={15} />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => { setPassword(event.target.value); setError(''); }}
                      placeholder="Enter demo password"
                      className="input-field pl-11 pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink/35 transition hover:bg-ink/5 hover:text-ink"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-racing/20 bg-racing/[0.04] px-4 py-3 text-[11px] font-medium text-racing"
                    role="alert"
                  >
                    {error}
                  </motion.p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in…
                    </>
                  ) : (
                    <>Sign in to dashboard <FiArrowRight size={15} /></>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <FiInfo size={16} className="mt-0.5 shrink-0 text-gold" />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-ink/70">Demo credentials</p>
                    <div className="mt-2 space-y-1 font-mono text-[11px] text-ink/55">
                      <p><span className="text-ink/35">Email:</span> {DEMO_ADMIN.email}</p>
                      <p><span className="text-ink/35">Password:</span> {DEMO_ADMIN.password}</p>
                    </div>
                    <button
                      type="button"
                      onClick={fillDemo}
                      className="mt-3 text-[10px] font-bold uppercase tracking-wider text-racing underline-offset-2 hover:underline"
                    >
                      Fill demo credentials
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-6 flex items-start gap-2 text-[10px] leading-relaxed text-ink/35">
                <FiShield size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                This is not real authentication. The demo login simply stores a local flag in
                this browser and provides no actual security.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
