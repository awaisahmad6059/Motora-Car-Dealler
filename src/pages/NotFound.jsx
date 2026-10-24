import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiHome, FiSearch } from 'react-icons/fi';
import PageMeta from '../components/PageMeta';

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="Page Not Found"
        description="The page you are looking for has left the showroom. Return to Motora Car Dealers."
      />
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-mist py-16 md:py-24">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-racing/[0.05] blur-3xl" />
        <div className="container-page relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-racing" />
              Error 404
            </span>
            <h1 className="mx-auto mt-4 font-display text-[80px] font-black leading-none tracking-tighter text-ink sm:text-[130px]">
              4<span className="text-racing">0</span>4
            </h1>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              This page took a wrong turn.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/50">
              The page you’re looking for has left the showroom. Let’s get you back
              to something with four wheels.
            </p>
          </motion.div>

          <div className="relative mx-auto mt-8 h-32 max-w-md overflow-hidden">
            <div className="absolute inset-x-0 bottom-4 h-px bg-ink/15" />
            <div className="absolute inset-x-0 bottom-[18px] flex justify-between">
              {Array.from({ length: 14 }).map((_, index) => (
                <motion.span
                  key={index}
                  animate={{ x: ['-80px', '420px'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', delay: index * 0.2 }}
                  className="h-1 w-6 rounded-full bg-ink/15"
                />
              ))}
            </div>
            <motion.div
              animate={{ x: [-16, 16, -16] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-5 left-1/2 -translate-x-1/2"
            >
              <svg width="210" height="80" viewBox="0 0 210 80" aria-hidden="true">
                <path d="M20 56h170l-15-24c-3-5-8-8-14-8H75c-7 0-13 3-17 9L38 56z" fill="#0B0B0F" />
                <path d="M64 28h55v20H55l9-20z" fill="#E10600" opacity=".8" />
                <path d="M130 28h22c4 0 8 2 10 6l9 14h-41V28z" fill="#33333d" />
                <circle cx="62" cy="58" r="16" fill="#0B0B0F" stroke="#F4F4F6" strokeWidth="5" />
                <circle cx="62" cy="58" r="5" fill="#F4F4F6" />
                <circle cx="156" cy="58" r="16" fill="#0B0B0F" stroke="#F4F4F6" strokeWidth="5" />
                <circle cx="156" cy="58" r="5" fill="#F4F4F6" />
                <circle cx="195" cy="53" r="3" fill="#C9A227" />
                <rect x="18" y="49" width="21" height="6" rx="3" fill="#E10600" />
              </svg>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap justify-center gap-3"
          >
            <Link to="/" className="btn-primary">
              <FiHome size={15} /> Back to home
            </Link>
            <Link to="/cars" className="btn-outline bg-white">
              <FiSearch size={15} /> Browse cars
            </Link>
          </motion.div>

          <div className="mt-8 flex flex-wrap justify-center gap-5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/35">
            <Link to="/finance" className="transition hover:text-racing">Finance</Link>
            <Link to="/track" className="transition hover:text-racing">Track booking</Link>
            <Link to="/contact" className="transition hover:text-racing">Contact</Link>
          </div>
        </div>
      </section>
    </>
  );
}
