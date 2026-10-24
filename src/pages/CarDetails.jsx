import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiBatteryCharging,
  FiCamera,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiDroplet,
  FiKey,
  FiMapPin,
  FiMonitor,
  FiMusic,
  FiNavigation,
  FiShare2,
  FiShield,
  FiSun,
  FiWind,
  FiX,
  FiZap,
} from 'react-icons/fi';
import SmartImage from '../components/SmartImage';
import PageMeta from '../components/PageMeta';
import EmptyState from '../components/EmptyState';
import CarCard, { SimilarCarCard } from '../components/CarCard';
import { Reveal, SectionHeading } from '../components/ui';
import { useToast } from '../components/Toast';
import {
  formatMileage,
  formatPKR,
  getCarById,
  getSimilarCars,
} from '../services/api';

const featureIcon = (feature) => {
  const text = feature.toLowerCase();
  if (/sunroof|roof|panoramic/.test(text)) return FiSun;
  if (/airbag|safety|assist|sensing|brake|blind|pilot|monitor/.test(text)) return FiShield;
  if (/audio|sound|bose|burmester|harman|jbl/.test(text)) return FiMusic;
  if (/seat|climate|ventilat|air/.test(text)) return FiWind;
  if (/charge|electric|range|battery|hybrid/.test(text)) return FiBatteryCharging;
  if (/camera|360/.test(text)) return FiCamera;
  if (/display|screen|cockpit|head-up|infotainment|carplay/.test(text)) return FiMonitor;
  if (/cruise|navigation|drive|mode/.test(text)) return FiNavigation;
  if (/key|start|entry/.test(text)) return FiKey;
  if (/light|lamp/.test(text)) return FiSun;
  if (/paint|colour|color/.test(text)) return FiDroplet;
  return FiCheckCircle;
};

function Gallery({ car, onOpen }) {
  const [active, setActive] = useState(0);
  const images = car.images?.length ? car.images : [''];
  const touchStart = useRef(null);

  const change = (direction) => {
    setActive((current) => (current + direction + images.length) % images.length);
  };

  return (
    <div>
      <div
        className="group relative overflow-hidden rounded-card bg-ink shadow-soft"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current == null) return;
          const distance = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(distance) > 50) change(distance > 0 ? -1 : 1);
          touchStart.current = null;
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0.4, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.3 }}
            transition={{ duration: 0.35 }}
            className="aspect-[4/3] w-full"
          >
            <SmartImage
              src={images[active]}
              alt={`${car.year} ${car.name} — photo ${active + 1}`}
              className="h-full w-full"
              imgClassName="object-cover"
              eager={active === 0}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-60" />
        <button
          type="button"
          onClick={() => onOpen(active)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label="Open fullscreen photo gallery"
        />
        <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
          <span className={car.condition === 'New' ? 'badge-new bg-white text-ink' : 'badge bg-ink/80 text-white backdrop-blur'}>
            {car.condition}
          </span>
          {car.isFeatured && <span className="badge-premium bg-gold text-ink">Premium</span>}
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-ink/65 px-3 py-1.5 text-[10px] font-medium text-white/80 backdrop-blur">
          {active + 1} / {images.length} · Tap to expand
        </div>

        {images.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => change(-1)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white"
              aria-label="Previous photo"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => change(1)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white"
              aria-label="Next photo"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative overflow-hidden rounded-xl border-2 transition ${
                index === active ? 'border-racing' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`View photo ${index + 1}`}
            >
              <SmartImage
                src={image}
                alt={`${car.name} thumbnail ${index + 1}`}
                className="aspect-[16/10] w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Lightbox({ car, index, onClose, onChange }) {
  const images = car.images?.length ? car.images : [''];
  const touchStart = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onChange((index + 1) % images.length);
      if (event.key === 'ArrowLeft') onChange((index - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, images.length, onChange, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col bg-[#050507]/97 text-white backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${car.name} photo gallery`}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <div>
          <p className="font-display text-sm font-bold">{car.name}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/35">
            Photo {index + 1} of {images.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
        >
          <FiX size={20} />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-3 pb-5 sm:px-16"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current == null) return;
          const distance = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(distance) > 50) {
            onChange(distance > 0 ? (index - 1 + images.length) % images.length : (index + 1) % images.length);
          }
          touchStart.current = null;
        }}
      >
        <button
          type="button"
          onClick={() => onChange((index - 1 + images.length) % images.length)}
          className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-5"
          aria-label="Previous photo"
        >
          <FiChevronLeft size={22} />
        </button>

        <motion.img
          key={images[index]}
          initial={{ opacity: 0.4, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={images[index]}
          alt={`${car.name} fullscreen photo ${index + 1}`}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
        />

        <button
          type="button"
          onClick={() => onChange((index + 1) % images.length)}
          className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5"
          aria-label="Next photo"
        >
          <FiChevronRight size={22} />
        </button>
      </div>

      <div className="flex justify-center gap-2 overflow-x-auto px-5 pb-5">
        {images.map((image, imageIndex) => (
          <button
            key={imageIndex}
            type="button"
            onClick={() => onChange(imageIndex)}
            className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
              imageIndex === index ? 'border-racing' : 'border-transparent opacity-50 hover:opacity-100'
            }`}
            aria-label={`Show photo ${imageIndex + 1}`}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [car, setCar] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [downPct, setDownPct] = useState(20);
  const [tenure, setTenure] = useState(60);
  const similarRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setCar(null);
    getCarById(id)
      .then(async (result) => {
        if (!alive) return;
        setCar(result);
        if (result) {
          const related = await getSimilarCars(result, 5);
          if (alive) setSimilar(related);
        }
      })
      .catch(() => {
        if (alive) setCar(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const monthly = useMemo(() => {
    if (!car) return 0;
    const downPayment = (Number(car.price) * downPct) / 100;
    const principal = Math.max(Number(car.price) - downPayment, 0);
    const monthlyRate = 13.99 / 100 / 12;
    if (monthlyRate === 0) return principal / tenure;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
  }, [car, downPct, tenure]);

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Vehicle link copied to clipboard.');
    } catch {
      showToast('Copy this page URL to share the vehicle.', 'info');
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Loading vehicle" description="Loading vehicle details from the Motora demo showroom." />
        <div className="container-page py-10">
          <div className="skeleton h-4 w-48" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="skeleton aspect-[4/3] w-full rounded-card" />
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="skeleton aspect-[16/10]" />
                <div className="skeleton aspect-[16/10]" />
                <div className="skeleton aspect-[16/10]" />
              </div>
              <div className="skeleton mt-10 h-40 w-full" />
            </div>
            <div className="skeleton h-[520px] w-full rounded-card" />
          </div>
        </div>
      </>
    );
  }

  if (!car) {
    return (
      <>
        <PageMeta title="Vehicle not found" description="This vehicle could not be found in the Motora demo showroom." />
        <div className="container-page py-20">
          <EmptyState
            title="This car has left the showroom"
            description="The vehicle may have been removed by the demo admin, or the link is incorrect."
            action={<Link to="/cars" className="btn-primary">Browse all cars</Link>}
          />
        </div>
      </>
    );
  }

  const sold = car.status === 'Sold';
  const specs = [
    ['Body type', car.bodyType],
    ['Engine', car.engine],
    ['Fuel type', car.fuel],
    ['Transmission', car.transmission],
    ['Model year', car.year],
    ['Mileage', formatMileage(car.mileage)],
    ['Exterior colour', car.color],
    ['Registration city', car.city],
    ['Condition', car.condition],
  ];

  return (
    <>
      <PageMeta
        title={`${car.year} ${car.name}`}
        description={`${car.description.slice(0, 150)}… ${car.condition} ${car.bodyType} available at Motora Car Dealers for ${formatPKR(car.price)}.`}
        image={car.images?.[0]}
        type="product"
      />

      <div className="border-b border-ink/[0.06] bg-mist">
        <div className="container-page flex items-center justify-between gap-4 py-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-ink/40">
            <Link to="/" className="transition hover:text-racing">Home</Link>
            <span>/</span>
            <Link to="/cars" className="transition hover:text-racing">Cars</Link>
            <span>/</span>
            <span className="max-w-[180px] truncate text-ink/65 sm:max-w-none">{car.name}</span>
          </nav>
          <button
            type="button"
            onClick={share}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink/55 transition hover:border-ink hover:text-ink"
          >
            <FiShare2 size={13} /> Share
          </button>
        </div>
      </div>

      <section className="bg-white pb-16 pt-8 md:pb-24 md:pt-10">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[1.16fr_0.84fr] lg:items-start">
            <Reveal>
              <Gallery car={car} onOpen={setLightbox} />

              <div className="mt-10 rounded-card border border-ink/[0.07] bg-white p-6 shadow-soft sm:p-8">
                <span className="eyebrow">The story</span>
                <h2 className="heading-md mt-3">About this {car.bodyType.toLowerCase()}</h2>
                <p className="mt-4 text-sm leading-relaxed text-ink/60">{car.description}</p>

                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ink/[0.07] pt-6 sm:grid-cols-4">
                  {[
                    { label: 'Year', value: car.year },
                    { label: 'Mileage', value: car.mileage === 0 ? 'Brand new' : formatMileage(car.mileage) },
                    { label: 'Fuel', value: car.fuel },
                    { label: 'Gearbox', value: car.transmission },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/30">{item.label}</p>
                      <p className="mt-1.5 text-xs font-semibold text-ink/80">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-card border border-ink/[0.07] bg-white p-6 shadow-soft sm:p-7">
                  <h2 className="font-display text-xl font-bold">Specifications</h2>
                  <table className="mt-4 w-full text-left text-xs">
                    <caption className="sr-only">Technical specifications for {car.name}</caption>
                    <tbody>
                      {specs.map(([label, value]) => (
                        <tr key={label} className="border-b border-ink/[0.06] last:border-0">
                          <th scope="row" className="w-1/2 py-3 font-medium text-ink/40">{label}</th>
                          <td className="py-3 font-semibold text-ink/80">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-card border border-ink/[0.07] bg-white p-6 shadow-soft sm:p-7">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">Features</h2>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/30">
                      {car.features?.length || 0} highlights
                    </span>
                  </div>
                  <ul className="mt-4 grid gap-3">
                    {(car.features || []).map((feature) => {
                      const Icon = featureIcon(feature);
                      return (
                        <li key={feature} className="flex items-center gap-3 text-xs font-medium text-ink/70">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-mist text-racing">
                            <Icon size={13} />
                          </span>
                          {feature}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:sticky lg:top-[118px]">
              <div className="overflow-hidden rounded-card border border-ink/[0.08] bg-white shadow-lift">
                <div className="border-b border-ink/[0.07] p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-racing">{car.brand}</span>
                    <span className="h-1 w-1 rounded-full bg-ink/20" />
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink/40">{car.model}</span>
                    {sold ? (
                      <span className="badge-sold ml-auto">Sold</span>
                    ) : (
                      <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[28px]">
                    {car.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink/45">
                    <span>{car.year}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-ink/30" />
                    <span>{car.mileage === 0 ? '0 km' : formatMileage(car.mileage)}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-ink/30" />
                    <span className="inline-flex items-center gap-1"><FiMapPin size={11} /> {car.city}</span>
                  </div>
                  <div className="mt-6 flex items-end gap-2">
                    <p className="font-display text-[34px] font-extrabold leading-none tracking-tight">{formatPKR(car.price)}</p>
                  </div>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-ink/35">Inclusive of demo taxes</p>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="rounded-xl bg-mist/70 p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">Estimated monthly</p>
                        <motion.p
                          key={Math.round(monthly)}
                          initial={{ opacity: 0.5, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 font-display text-2xl font-extrabold tracking-tight text-racing"
                        >
                          {formatPKR(Math.round(monthly))}
                        </motion.p>
                      </div>
                      <span className="text-right text-[9px] leading-relaxed text-ink/35">
                        {tenure} months<br />13.99% APR
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-medium text-ink/50">
                        <span>Down payment · {downPct}%</span>
                        <span>{formatPKR(Math.round((car.price * downPct) / 100))}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="70"
                        step="5"
                        value={downPct}
                        onChange={(event) => setDownPct(Number(event.target.value))}
                        className="mt-2 w-full"
                        aria-label="Down payment percentage"
                      />
                    </div>

                    <div className="mt-3 flex gap-1.5">
                      {[36, 48, 60, 84].map((months) => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setTenure(months)}
                          className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold transition ${
                            tenure === months
                              ? 'bg-ink text-white'
                              : 'bg-white text-ink/50 hover:bg-white hover:text-ink'
                          }`}
                        >
                          {months} mo
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-ink/15 px-4 py-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/35">Reserve with</p>
                      <p className="mt-1 font-display text-base font-extrabold">{formatPKR(50000)}</p>
                    </div>
                    <span className="badge-premium">Pre-booking token</span>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {sold ? (
                      <div className="rounded-xl bg-racing/5 px-4 py-3 text-center text-xs font-medium text-racing">
                        This car has been sold. Browse similar available vehicles below.
                      </div>
                    ) : (
                      <>
                        <Link to={`/book/${car.id}`} className="btn-primary w-full">
                          Book Now <FiArrowRight size={15} />
                        </Link>
                        <Link to={`/book/pre/${car.id}`} className="btn-outline w-full">
                          Pre-Book Now
                        </Link>
                      </>
                    )}
                    <Link to="/contact" className="flex items-center justify-center gap-2 pt-1 text-[11px] font-medium text-ink/40 transition hover:text-racing">
                      <FiClock size={12} /> Schedule a showroom visit
                    </Link>
                  </div>

                  <div className="demo-note mt-5">
                    <FiShield size={14} className="mt-0.5 shrink-0 text-gold" />
                    <p>
                      Demo vehicle. No real payment is taken. Monthly estimate uses a
                      sample rate and is for illustration only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { icon: FiShield, label: 'Inspected' },
                  { icon: FiCheckCircle, label: 'Clear history' },
                  { icon: FiZap, label: 'Fast reserve' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-ink/[0.06] bg-white px-2 py-3 text-center shadow-soft">
                    <Icon size={15} className="text-racing" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink/45">{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="border-t border-ink/[0.06] bg-mist py-16 md:py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Keep exploring"
              title="Similar cars you may like."
              action={
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => similarRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                    className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white transition hover:border-ink hover:bg-ink hover:text-white"
                    aria-label="Previous similar cars"
                  >
                    <FiArrowLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => similarRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                    className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white transition hover:border-ink hover:bg-ink hover:text-white"
                    aria-label="Next similar cars"
                  >
                    <FiArrowRight size={15} />
                  </button>
                </div>
              }
            />
            <div ref={similarRef} className="hide-scrollbar mt-8 flex snap-x gap-4 overflow-x-auto pb-3">
              {similar.map((relatedCar) => (
                <div key={relatedCar.id} className="snap-start">
                  <SimilarCarCard car={relatedCar} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            car={car}
            index={lightbox}
            onChange={setLightbox}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
