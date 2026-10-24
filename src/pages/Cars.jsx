import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiRotateCcw,
  FiSearch,
  FiSliders,
  FiX,
} from 'react-icons/fi';
import CarCard from '../components/CarCard';
import PageMeta from '../components/PageMeta';
import EmptyState from '../components/EmptyState';
import { CarCardSkeleton } from '../components/Skeletons';
import { Reveal } from '../components/ui';
import { getCars } from '../services/api';

const EMPTY_FILTERS = {
  search: '',
  brand: '',
  bodyType: '',
  fuel: '',
  transmission: '',
  condition: '',
  year: '',
  minPrice: '',
  maxPrice: '',
};

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'mileage-asc', label: 'Lowest mileage' },
];

const PAGE_SIZE = 6;
const normalize = (value) => String(value ?? '').toLowerCase();

export default function Cars() {
  const [searchParams] = useSearchParams();
  const searchKey = searchParams.toString();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('newest');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchKey);
    setFilters((current) => ({
      ...current,
      brand: params.get('brand') || '',
      bodyType: params.get('bodyType') || '',
      condition: params.get('condition') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      search: params.get('search') || '',
    }));
  }, [searchKey]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCars({})
      .then((data) => {
        if (alive) setCars(data);
      })
      .catch(() => {
        if (alive) setCars([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const options = useMemo(() => {
    const unique = (key) => [...new Set(cars.map((car) => car[key]).filter(Boolean))].sort();
    return {
      brands: unique('brand'),
      bodyTypes: unique('bodyType'),
      fuels: unique('fuel'),
      transmissions: unique('transmission'),
      conditions: unique('condition'),
      years: [...new Set(cars.map((car) => car.year))].sort((a, b) => b - a),
    };
  }, [cars]);

  const filtered = useMemo(() => {
    const list = cars.filter((car) => {
      if (filters.search) {
        const haystack = `${car.name} ${car.brand} ${car.model} ${car.city}`.toLowerCase();
        if (!haystack.includes(normalize(filters.search))) return false;
      }
      if (filters.brand && normalize(car.brand) !== normalize(filters.brand)) return false;
      if (filters.bodyType && normalize(car.bodyType) !== normalize(filters.bodyType)) return false;
      if (filters.fuel && normalize(car.fuel) !== normalize(filters.fuel)) return false;
      if (filters.transmission && normalize(car.transmission) !== normalize(filters.transmission)) return false;
      if (filters.condition && normalize(car.condition) !== normalize(filters.condition)) return false;
      if (filters.year && String(car.year) !== String(filters.year)) return false;
      if (filters.minPrice !== '' && Number(car.price) < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== '' && Number(car.price) > Number(filters.maxPrice)) return false;
      return true;
    });

    return list.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'mileage-asc':
          return a.mileage - b.mileage;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [cars, filters, sort]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters, sort]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSort('newest');
  };

  const activeCount = Object.entries(filters).filter(([key, value]) => key !== 'search' && value !== '').length;
  const shown = filtered.slice(0, visible);

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-ink/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <FiSliders size={16} className="text-racing" />
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em]">Filters</h2>
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-racing px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink/40 transition hover:text-racing"
        >
          <FiRotateCcw size={11} /> Reset
        </button>
      </div>

      <label className="block">
        <span className="input-label">Brand</span>
        <div className="relative">
          <select
            value={filters.brand}
            onChange={(event) => updateFilter('brand', event.target.value)}
            className="select-field"
          >
            <option value="">All brands</option>
            {options.brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </label>

      <fieldset>
        <legend className="input-label">Body type</legend>
        <div className="grid grid-cols-2 gap-2">
          {['Sedan', 'SUV', 'Hatchback', 'Coupe'].map((type) => {
            const active = filters.bodyType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => updateFilter('bodyType', active ? '' : type)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                  active
                    ? 'border-racing bg-racing/5 text-racing'
                    : 'border-ink/10 text-ink/60 hover:border-ink/30'
                }`}
              >
                {type}
                {active && <FiCheck size={12} />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="input-label">Fuel</span>
          <select
            value={filters.fuel}
            onChange={(event) => updateFilter('fuel', event.target.value)}
            className="select-field px-3 py-2.5 text-xs"
          >
            <option value="">Any fuel</option>
            {options.fuels.map((fuel) => (
              <option key={fuel} value={fuel}>{fuel}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="input-label">Gearbox</span>
          <select
            value={filters.transmission}
            onChange={(event) => updateFilter('transmission', event.target.value)}
            className="select-field px-3 py-2.5 text-xs"
          >
            <option value="">Any</option>
            {options.transmissions.map((transmission) => (
              <option key={transmission} value={transmission}>{transmission}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="input-label">Condition</span>
          <select
            value={filters.condition}
            onChange={(event) => updateFilter('condition', event.target.value)}
            className="select-field px-3 py-2.5 text-xs"
          >
            <option value="">New & used</option>
            {options.conditions.map((condition) => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="input-label">Year</span>
          <select
            value={filters.year}
            onChange={(event) => updateFilter('year', event.target.value)}
            className="select-field px-3 py-2.5 text-xs"
          >
            <option value="">Any year</option>
            {options.years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="input-label">Price range (PKR)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="100000"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(event) => updateFilter('minPrice', event.target.value)}
            className="input-field px-3 py-2.5 text-xs"
            aria-label="Minimum price in PKR"
          />
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="100000"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(event) => updateFilter('maxPrice', event.target.value)}
            className="input-field px-3 py-2.5 text-xs"
            aria-label="Maximum price in PKR"
          />
        </div>
        <p className="mt-2 text-[10px] text-ink/35">Example: 5,000,000 – 15,000,000</p>
      </fieldset>

      <div className="rounded-xl bg-mist px-4 py-3">
        <p className="text-[11px] leading-relaxed text-ink/45">
          All inventory is demo data stored in your browser. Prices in PKR.
        </p>
      </div>

      <button type="button" onClick={() => setMobileFilters(false)} className="btn-primary w-full lg:hidden">
        Show {filtered.length} cars
      </button>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Cars for Sale"
        description="Browse new and used cars at Motora Car Dealers. Filter by brand, body type, fuel, transmission, price and year. Demo inventory."
      />

      <section className="relative overflow-hidden bg-ink pb-20 pt-14 text-white md:pb-24 md:pt-20">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-racing/10 blur-[100px]" />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/70">Cars</span>
          </nav>
          <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="eyebrow text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-racing" />
                The collection
              </span>
              <h1 className="heading-xl mt-4">Find your perfect drive.</h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/45">
                New and pre-owned cars, each selected for quality and character.
                Refine the collection to find the one that fits.
              </p>
            </div>
            <div className="flex gap-8 text-left">
              <div>
                <p className="font-display text-3xl font-extrabold">{cars.filter((car) => car.condition === 'New').length}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/35">New models</p>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <p className="font-display text-3xl font-extrabold">{cars.filter((car) => car.condition === 'Used').length}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/35">Pre-owned</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page relative -mt-10 pb-16 md:pb-24">
        <Reveal>
          <div className="rounded-card border border-ink/[0.07] bg-white p-3 shadow-soft sm:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Search cars by name or brand</span>
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" size={17} />
                <input
                  type="search"
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Search by name, brand or city…"
                  className="w-full rounded-xl border border-ink/10 bg-mist/60 py-3.5 pl-11 pr-10 text-sm transition focus:border-racing focus:bg-white focus:outline-none focus:ring-4 focus:ring-racing/10"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => updateFilter('search', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/35 hover:bg-ink/5 hover:text-ink"
                    aria-label="Clear search"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFilters((value) => !value)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink/10 px-4 py-3.5 text-xs font-semibold md:hidden"
                  aria-expanded={mobileFilters}
                >
                  <FiFilter size={14} />
                  Filters
                  {activeCount > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-racing px-1 text-[9px] text-white">
                      {activeCount}
                    </span>
                  )}
                </button>
                <div className="relative min-w-[170px] flex-1 md:flex-none">
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="select-field py-3.5 pr-9 text-xs font-semibold"
                    aria-label="Sort cars"
                  >
                    {SORTS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <aside className={`${mobileFilters ? 'block' : 'hidden'} lg:block lg:w-[280px] lg:shrink-0`}>
            <div className="rounded-card border border-ink/[0.07] bg-white p-5 shadow-soft lg:sticky lg:top-[118px]">
              {filterPanel}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-ink/[0.07] pb-4">
              <p className="text-xs text-ink/50">
                Showing <span className="font-semibold text-ink">{Math.min(visible, filtered.length)}</span> of{' '}
                <span className="font-semibold text-ink">{filtered.length}</span> vehicles
              </p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-racing"
                >
                  Clear {activeCount} filter{activeCount > 1 ? 's' : ''} <FiX size={12} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <CarCardSkeleton count={6} />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={FiSearch}
                title="No cars match those filters"
                description="Try broadening your price range or clearing a filter or two. Your perfect car may still be in the showroom."
                action={
                  <button type="button" onClick={resetFilters} className="btn-primary">
                    Reset all filters
                  </button>
                }
              />
            ) : (
              <>
                <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {shown.map((car, index) => (
                      <CarCard key={car.id} car={car} index={index} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {visible < filtered.length && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setVisible((value) => value + PAGE_SIZE)}
                      className="btn-dark min-w-[220px]"
                    >
                      Load more cars
                      <FiChevronDown />
                    </button>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink/35">
                      {filtered.length - visible} more available
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
