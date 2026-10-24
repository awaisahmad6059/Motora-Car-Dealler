import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCreditCard,
  FiInfo,
  FiLoader,
  FiMapPin,
  FiPackage,
  FiSearch,
  FiUser,
  FiX,
} from 'react-icons/fi';
import PageMeta from '../components/PageMeta';
import SmartImage from '../components/SmartImage';
import { getBookingByReference, getCarById, formatDate, formatPKR } from '../services/api';
import { Reveal } from '../components/ui';

const STAGES = [
  { status: 'Pre-Booked', label: 'Pre-booked', description: 'Reservation logged' },
  { status: 'Booked', label: 'Booked', description: 'Booking confirmed' },
  { status: 'Delivered', label: 'Delivered', description: 'Handover complete' },
];

const statusStyles = {
  'Pre-Booked': 'bg-gold/15 text-[#8a6d12]',
  Booked: 'bg-blue-50 text-blue-700',
  Cancelled: 'bg-racing/10 text-racing',
  Delivered: 'bg-emerald-50 text-emerald-700',
};

export default function Track() {
  const [reference, setReference] = useState('');
  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (event) => {
    event.preventDefault();
    const query = reference.trim();
    if (!query) {
      setError('Enter your booking reference to continue.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    setBooking(null);
    setCar(null);
    try {
      const result = await getBookingByReference(query);
      if (!result) {
        setError(`No booking found for “${query}”. Check the reference and try again.`);
        return;
      }
      setBooking(result);
      const vehicle = await getCarById(result.carId);
      setCar(vehicle);
    } catch {
      setError('Something went wrong while looking up your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useSample = () => {
    setReference('MTR-20261012-0001');
    setError('');
  };

  const stageIndex = booking ? STAGES.findIndex((stage) => stage.status === booking.status) : -1;
  const cancelled = booking?.status === 'Cancelled';

  return (
    <>
      <PageMeta
        title="Track Your Booking"
        description="Check the status of your Motora demo car booking using your MTR booking reference."
      />

      <section className="relative overflow-hidden bg-ink pb-24 pt-12 text-white md:pb-32 md:pt-16">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-racing/[0.09] blur-[100px]" />
        <div className="container-page relative text-center">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/35">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/70">Track Booking</span>
          </nav>
          <span className="eyebrow text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-racing" />
            Booking tracker
          </span>
          <h1 className="heading-xl mx-auto mt-4 max-w-3xl text-balance">Where is my car?</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/45">
            Enter the reference from your confirmation screen to see the current
            status of your demo booking.
          </p>
        </div>
      </section>

      <section className="bg-mist pb-16 md:pb-24">
        <div className="container-page">
          <Reveal className="relative z-10 -mt-12 md:-mt-14">
            <form
              onSubmit={handleTrack}
              className="mx-auto max-w-2xl rounded-card border border-ink/[0.06] bg-white p-4 shadow-lift sm:p-5"
            >
              <label htmlFor="reference" className="input-label">Booking reference</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" size={17} />
                  <input
                    id="reference"
                    type="text"
                    value={reference}
                    onChange={(event) => {
                      setReference(event.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="MTR-20261012-0001"
                    className="w-full rounded-xl border border-ink/10 bg-mist/60 py-3.5 pl-11 pr-4 font-mono text-sm tracking-wider transition focus:border-racing focus:bg-white focus:outline-none focus:ring-4 focus:ring-racing/10"
                    autoComplete="off"
                  />
                  {reference && (
                    <button
                      type="button"
                      onClick={() => { setReference(''); setError(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/30 transition hover:text-ink"
                      aria-label="Clear reference"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
                <button type="submit" disabled={loading} className="btn-primary sm:min-w-[140px]">
                  {loading ? <><FiLoader className="animate-spin" size={15} /> Checking…</> : <>Track <FiArrowRight size={15} /></>}
                </button>
              </div>
              {error && <p className="mt-2 text-[11px] font-medium text-racing">{error}</p>}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] text-ink/35">Find your reference in the booking confirmation or confirmation message.</p>
                <button type="button" onClick={useSample} className="text-[10px] font-semibold text-racing underline-offset-2 hover:underline">
                  Try a sample reference
                </button>
              </div>
            </form>
          </Reveal>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-8 max-w-3xl"
              >
                <div className="skeleton h-64 w-full rounded-card" />
              </motion.div>
            )}

            {!loading && booking && (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
                className="mx-auto mt-8 max-w-3xl space-y-5"
              >
                <div className="overflow-hidden rounded-card border border-ink/[0.06] bg-white shadow-soft">
                  <div className="flex flex-col justify-between gap-4 border-b border-ink/[0.07] p-6 sm:flex-row sm:items-center sm:p-7">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink/35">Booking reference</p>
                      <p className="mt-1.5 font-display text-xl font-extrabold tracking-[0.07em]">{booking.reference}</p>
                    </div>
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[booking.status] || 'bg-mist text-ink/60'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {booking.status}
                    </span>
                  </div>

                  <div className="p-6 sm:p-7">
                    {cancelled ? (
                      <div className="rounded-xl bg-racing/[0.04] px-4 py-4 text-sm text-racing">
                        This demo booking has been cancelled. Please contact the showroom if you
                        would like to make a new reservation.
                      </div>
                    ) : (
                      <div>
                        <div className="relative">
                          <div className="absolute left-4 right-4 top-4 h-0.5 bg-ink/[0.08] sm:left-8 sm:right-8" />
                          <div
                            className="absolute left-4 top-4 h-0.5 bg-racing transition-all duration-700 sm:left-8"
                            style={{ width: `calc(${(Math.max(stageIndex, 0) / (STAGES.length - 1)) * 100}% - ${stageIndex === 0 ? 0 : 2}rem)` }}
                          />
                          <ol className="relative grid grid-cols-3 gap-2">
                            {STAGES.map((stage, index) => {
                              const complete = index < stageIndex;
                              const active = index === stageIndex;
                              return (
                                <li key={stage.status} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                                  <span
                                    className={`z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-[10px] font-bold ${
                                      complete
                                        ? 'border-racing bg-racing text-white'
                                        : active
                                          ? 'border-racing bg-white text-racing ring-4 ring-racing/10'
                                          : 'border-ink/10 bg-white text-ink/25'
                                    }`}
                                  >
                                    {complete ? <FiCheck size={13} /> : index + 1}
                                  </span>
                                  <p className={`mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] ${active ? 'text-ink' : complete ? 'text-racing' : 'text-ink/30'}`}>
                                    {stage.label}
                                  </p>
                                  <p className="mt-1 hidden text-[9px] text-ink/35 sm:block">{stage.description}</p>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                        <div className="mt-7 rounded-xl bg-mist/70 px-4 py-3">
                          <p className="text-[10px] font-medium text-ink/50">
                            {stageIndex === 0 && 'Your pre-booking is logged. The showroom will contact you to confirm the next step.'}
                            {stageIndex === 1 && 'Your booking is confirmed. Our team is preparing the vehicle for handover.'}
                            {stageIndex === 2 && 'Delivered! Thank you for choosing Motora. We hope you love the drive.'}
                            {stageIndex < 0 && 'Your booking is being reviewed by the showroom team.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="overflow-hidden rounded-card border border-ink/[0.06] bg-white shadow-soft">
                    {car ? (
                      <>
                        <SmartImage src={car.images?.[0]} alt={car.name} className="h-40 w-full" />
                        <div className="p-5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-racing">{car.brand}</p>
                          <h2 className="mt-1.5 font-display text-lg font-bold">{car.name}</h2>
                          <p className="mt-1 text-[11px] text-ink/40">{car.year} · {car.color} · {car.transmission}</p>
                          <div className="mt-4 flex items-center justify-between border-t border-ink/[0.07] pt-4">
                            <p className="font-display text-lg font-extrabold">{formatPKR(car.price)}</p>
                            <Link to={`/cars/${car.id}`} className="text-[10px] font-semibold text-racing">
                              View car
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/35">Vehicle</p>
                        <p className="mt-2 text-sm font-semibold">Vehicle no longer in inventory</p>
                        <p className="mt-1 text-xs text-ink/45">Car ID: {booking.carId}</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-card border border-ink/[0.06] bg-white p-5 shadow-soft sm:p-6">
                    <h2 className="font-display text-base font-bold">Booking details</h2>
                    <dl className="mt-4 space-y-3.5 text-xs">
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-2 text-ink/40"><FiUser size={12} /> Customer</dt>
                        <dd className="text-right font-semibold">{booking.customer.name}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-2 text-ink/40"><FiPackage size={12} /> Type</dt>
                        <dd className="text-right font-semibold">{booking.type === 'PreBooking' ? 'Pre-booking' : 'Full booking'}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-2 text-ink/40"><FiCreditCard size={12} /> Amount</dt>
                        <dd className="text-right font-semibold">
                          {booking.type === 'PreBooking' ? formatPKR(booking.tokenAmount) : formatPKR(car?.price || 0)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-2 text-ink/40"><FiCalendar size={12} /> Visit date</dt>
                        <dd className="text-right font-semibold">{formatDate(booking.preferences?.visitDate)}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-2 text-ink/40"><FiMapPin size={12} /> Handover</dt>
                        <dd className="text-right font-semibold">{booking.preferences?.delivery || 'Pickup'}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-2 text-ink/40"><FiClock size={12} /> Created</dt>
                        <dd className="text-right font-semibold">{formatDate(booking.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="demo-note bg-white">
                  <FiInfo size={14} className="mt-0.5 shrink-0 text-gold" />
                  <p>
                    This tracker reads demo bookings from your browser. Statuses are updated
                    only by the demo admin panel at <Link to="/admin/login" className="font-semibold text-racing">/admin</Link>.
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && searched && !booking && error && (
              <motion.div
                key="not-found"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-8 max-w-2xl rounded-card border border-dashed border-ink/15 bg-white px-6 py-10 text-center shadow-soft"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-racing/5 text-racing">
                  <FiSearch size={23} />
                </span>
                <h2 className="mt-4 font-display text-lg font-bold">Booking not found</h2>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink/45">
                  {error} Double-check the reference, or try the sample booking to see how tracking works.
                </p>
                <button type="button" onClick={useSample} className="btn-outline mt-5">Use sample reference</button>
              </motion.div>
            )}
          </AnimatePresence>

          {!searched && (
            <Reveal delay={0.15} className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                { icon: FiSearch, title: 'Enter your reference', text: 'Use the MTR code from your confirmation.' },
                { icon: FiClock, title: 'See live status', text: 'View pre-booked, booked or delivered.' },
                { icon: FiCheck, title: 'Plan your visit', text: 'Your preferred date and handover details.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-card border border-ink/[0.06] bg-white p-5 shadow-soft">
                  <Icon size={17} className="text-racing" />
                  <h3 className="mt-3 text-xs font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-ink/40">{text}</p>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
