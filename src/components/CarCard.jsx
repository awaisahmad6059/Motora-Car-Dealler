import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiArrowUpRight, FiActivity, FiZap } from 'react-icons/fi';
import { formatMileage, formatPKR } from '../services/api';
import SmartImage from './SmartImage';
import { Stars } from './ui';

export default function CarCard({ car, index = 0, compact = false }) {
  const sold = car.status === 'Sold';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
      whileHover={sold ? undefined : { y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-card border border-ink/[0.07] bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <div className={`relative overflow-hidden ${compact ? 'h-44' : 'h-52'}`}>
        <SmartImage
          src={car.images?.[0]}
          alt={`${car.year} ${car.name}`}
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-70" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {car.isFeatured && <span className="badge bg-gold text-ink shadow-sm">Premium</span>}
          <span className={car.condition === 'New' ? 'badge bg-white text-ink' : 'badge bg-ink/80 text-white backdrop-blur'}>
            {car.condition}
          </span>
        </div>
        {car.isNewArrival && car.condition === 'New' && (
          <span className="absolute right-3 top-3 badge bg-racing text-white shadow-sm">New arrival</span>
        )}
        {sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/55 backdrop-blur-[1px]">
            <span className="rotate-[-6deg] rounded-full border-2 border-white px-5 py-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-white">
              Sold
            </span>
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            {car.city}
          </span>
          <Link
            to={`/cars/${car.id}`}
            className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow-lg transition hover:bg-racing hover:text-white"
          >
            View Details
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing">{car.brand}</span>
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-ink/40">
            <FiActivity size={12} />
            {formatMileage(car.mileage)}
          </span>
        </div>

        <Link to={`/cars/${car.id}`} className="mt-2">
          <h3 className="line-clamp-1 font-display text-[17px] font-bold tracking-tight transition-colors group-hover:text-racing">
            {car.name}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink/50">
          <span>{car.year}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-ink/25" />
          <span>{car.transmission}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-ink/25" />
          <span className="inline-flex items-center gap-1">
            <FiZap size={10} className="text-racing" />
            {car.fuel}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-ink/[0.07] pt-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/35">Starting from</p>
            <p className="mt-1 font-display text-lg font-extrabold tracking-tight">{formatPKR(car.price)}</p>
          </div>
          <div className="flex items-center gap-2">
            {!sold && (
              <Link
                to={`/book/pre/${car.id}`}
                className="rounded-full border border-ink/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition hover:border-racing hover:bg-racing hover:text-white"
              >
                Pre-Book
              </Link>
            )}
            <Link
              to={`/cars/${car.id}`}
              aria-label={`View details for ${car.name}`}
              className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white transition hover:bg-racing"
            >
              <FiArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function SimilarCarCard({ car }) {
  return (
    <Link
      to={`/cars/${car.id}`}
      className="group flex min-w-[280px] max-w-[280px] flex-col overflow-hidden rounded-card border border-ink/[0.07] bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:min-w-[320px] sm:max-w-[320px]"
    >
      <div className="h-40 overflow-hidden">
        <SmartImage
          src={car.images?.[0]}
          alt={car.name}
          className="h-full w-full"
          imgClassName="transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-racing">{car.brand}</p>
        <h3 className="mt-1.5 line-clamp-1 font-display text-sm font-bold">{car.name}</h3>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-sm font-extrabold">{formatPKR(car.price)}</p>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-mist transition group-hover:bg-racing group-hover:text-white">
            <FiArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
