import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiChevronDown, FiSearch, FiShield, FiStar } from 'react-icons/fi';

const brands = ['Any brand', 'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia', 'Porsche', 'MG', 'Suzuki'];
const bodyTypes = ['Any body type', 'Sedan', 'SUV', 'Hatchback', 'Coupe'];
const budgets = [
  { label: 'Any budget', min: '', max: '' },
  { label: 'Under PKR 5M', min: '', max: '5000000' },
  { label: 'PKR 5M – 10M', min: '5000000', max: '10000000' },
  { label: 'PKR 10M – 20M', min: '10000000', max: '20000000' },
  { label: 'PKR 20M+', min: '20000000', max: '' },
];

export default function Hero() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [budget, setBudget] = useState('0');

  const handleSearch = (event) => {
    event.preventDefault();
    const selected = budgets[Number(budget)] || budgets[0];
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (bodyType) params.set('bodyType', bodyType);
    if (selected.min) params.set('minPrice', selected.min);
    if (selected.max) params.set('maxPrice', selected.max);
    navigate(`/cars${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85"
          alt=""
          aria-hidden="true"
          className="h-full w-full origin-center object-cover object-[62%_center] opacity-70 motion-safe:animate-kenburns"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      <div className="container-page relative flex min-h-[calc(100svh-104px)] flex-col justify-center pb-10 pt-16 sm:pb-12 sm:pt-20 lg:min-h-[760px] lg:pb-14 lg:pt-24">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-7 flex flex-wrap items-center gap-3"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-racing" />
                Premium automotive experience
              </span>
              <span className="hidden items-center gap-1.5 text-[11px] text-white/45 sm:flex">
                <FiStar size={12} className="text-gold" fill="currentColor" />
                4.9/5 from 1,200+ owners
              </span>
            </motion.div>

            <h1 className="heading-xl text-balance">
              <motion.span
                className="block overflow-hidden"
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                Drive the Future.
              </motion.span>
              <motion.span
                className="mt-1 block text-white/55"
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Book Your Dream Car Today.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.46 }}
              className="mt-6 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base"
            >
              Explore a handpicked collection of new and pre-owned cars, reserve online
              in minutes, and let our team handle the rest — from finance to home delivery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.58 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/cars" className="btn-primary">
                Explore Cars <FiArrowRight />
              </Link>
              <Link to="/contact" className="btn-ghost">
                Book a Test Drive
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="hidden flex-col gap-3 lg:flex"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-md">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-racing/15 text-racing">
                <FiShield size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">200-point inspection</p>
                <p className="mt-0.5 text-[10px] text-white/40">On every pre-owned car</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-md">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold">
                <FiStar size={17} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">7-day exchange promise</p>
                <p className="mt-0.5 text-[10px] text-white/40">Drive it. Love it. Keep it.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 rounded-2xl border border-white/[0.12] bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl sm:mt-16 sm:p-4 lg:mt-20"
          role="search"
          aria-label="Search the car collection"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_auto] lg:items-end">
            <label className="group rounded-xl px-3 py-2 transition hover:bg-white/5">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Brand</span>
              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className="w-full cursor-pointer appearance-none bg-transparent text-sm font-medium text-white focus:outline-none [&>option]:bg-ink"
              >
                {brands.map((item) => (
                  <option key={item} value={item === 'Any brand' ? '' : item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <span className="hidden h-10 w-px self-center bg-white/10 lg:block" />
            <label className="group rounded-xl px-3 py-2 transition hover:bg-white/5">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Body type</span>
              <select
                value={bodyType}
                onChange={(event) => setBodyType(event.target.value)}
                className="w-full cursor-pointer appearance-none bg-transparent text-sm font-medium text-white focus:outline-none [&>option]:bg-ink"
              >
                {bodyTypes.map((item) => (
                  <option key={item} value={item === 'Any body type' ? '' : item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <span className="hidden h-10 w-px self-center bg-white/10 lg:block" />
            <label className="group rounded-xl px-3 py-2 transition hover:bg-white/5">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Budget</span>
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="w-full cursor-pointer appearance-none bg-transparent text-sm font-medium text-white focus:outline-none [&>option]:bg-ink"
              >
                {budgets.map((item, index) => (
                  <option key={item.label} value={String(index)}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn-primary h-[46px] w-full px-6 lg:w-auto">
              <FiSearch size={15} />
              Search Cars
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-8 flex items-center justify-between gap-5 text-[10px] uppercase tracking-[0.18em] text-white/30"
        >
          <p>12 curated vehicles · 4 new 2026 models</p>
          <span className="hidden items-center gap-2 sm:flex">
            Scroll to explore
            <FiChevronDown className="animate-bounce text-white/50" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
