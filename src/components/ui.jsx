import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export function Reveal({ children, delay = 0, y = 26, className = '', once = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  action,
  className = '',
}) {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start';
  return (
    <Reveal className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className={`flex max-w-2xl flex-col ${alignment}`}>
        {eyebrow && (
          <span className={`eyebrow mb-4 ${light ? 'text-white/60' : ''}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-racing" />
            {eyebrow}
          </span>
        )}
        <h2 className={`heading-lg text-balance ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
        {description && (
          <p className={`mt-4 max-w-xl text-sm leading-relaxed sm:text-base ${light ? 'text-white/55' : 'muted'}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}

export function AnimatedStat({ value, suffix = '', prefix = '', label, icon: Icon, light = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const duration = 1700;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div ref={ref} className="flex flex-col items-start gap-3">
      {Icon && (
        <span
          className={`mb-1 grid h-11 w-11 place-items-center rounded-full ${
            light ? 'bg-white/10 text-white' : 'bg-racing/10 text-racing'
          }`}
        >
          <Icon size={19} />
        </span>
      )}
      <div
        className={`font-display text-4xl font-extrabold tracking-tight sm:text-5xl ${
          light ? 'text-white' : 'text-ink'
        }`}
      >
        {prefix}
        {display.toLocaleString('en-PK')}
        {suffix}
      </div>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${light ? 'text-white/45' : 'text-ink/50'}`}>
        {label}
      </p>
    </div>
  );
}

export function LinkArrow({ to, children, light = false, className = '' }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
        light ? 'text-white hover:text-white/70' : 'text-ink hover:text-racing'
      } ${className}`}
    >
      {children}
      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function Stars({ count = 5, className = '' }) {
  return (
    <div className={`flex gap-0.5 text-gold ${className}`} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, index) => (
        <svg key={index} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.2l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.1l-5.9 3.1 1.2-6.5L2.5 9.1l6.6-.9z" />
        </svg>
      ))}
    </div>
  );
}

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
