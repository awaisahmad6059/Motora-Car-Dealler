import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiCopy,
  FiCreditCard,
  FiHome,
  FiInfo,
  FiLoader,
  FiLock,
  FiMapPin,
  FiSmartphone,
  FiSliders,
  FiTag,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import PageMeta from '../components/PageMeta';
import EmptyState from '../components/EmptyState';
import SmartImage from '../components/SmartImage';
import { useToast } from '../components/Toast';
import {
  createBooking,
  formatDate,
  formatPKR,
  getCarById,
} from '../services/api';

const STEPS = [
  { label: 'Your details', short: 'Details', icon: FiUser },
  { label: 'Booking option', short: 'Option', icon: FiTag },
  { label: 'Preferences', short: 'Preferences', icon: FiSliders },
  { label: 'Review', short: 'Review', icon: FiClipboard },
];

const TOKEN_OPTIONS = [25000, 50000, 100000];

const PAYMENT_METHODS = [
  {
    value: 'Bank Transfer',
    label: 'Bank Transfer',
    description: 'Transfer the full amount to the Motora demo account. No real transaction occurs.',
    icon: FiCreditCard,
  },
  {
    value: 'Easypaisa / JazzCash',
    label: 'Easypaisa / JazzCash',
    description: 'A simulated mobile wallet payment step. Nothing will be charged.',
    icon: FiSmartphone,
  },
  {
    value: 'Pay at Showroom',
    label: 'Pay at Showroom',
    description: 'Reserve now and complete payment when you collect the car.',
    icon: FiHome,
  },
];

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan', 'Quetta'];

const todayString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

const phoneDigits = (value) => String(value || '').replace(/\D/g, '');

function Field({ label, id, error, hint, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="input-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[11px] font-medium text-racing">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[10px] text-ink/35">{hint}</p>
      )}
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 34 }).map((_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        color: ['#E10600', '#C9A227', '#0B0B0F', '#ffffff', '#f2b8b5'][index % 5],
        delay: (index % 9) * 0.055,
        duration: 2.2 + (index % 5) * 0.22,
        rotate: (index * 53) % 360,
        width: index % 3 === 0 ? 8 : 5,
        height: index % 4 === 0 ? 12 : 7,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ y: -30, opacity: 0, rotate: 0 }}
          animate={{ y: 500, opacity: [0, 1, 1, 0], rotate: piece.rotate + 260 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeIn' }}
          className="absolute top-0 block rounded-sm"
          style={{
            left: piece.left,
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}

export default function BookingFlow({ mode = 'pre' }) {
  const isFull = mode === 'full';
  const { carId } = useParams();
  const { showToast } = useToast();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    cnic: '',
    city: '',
    tokenAmount: 50000,
    paymentMethod: isFull ? 'Bank Transfer' : 'Pay at Showroom',
    color: '',
    delivery: 'Pickup',
    visitDate: '',
    address: '',
    agree: false,
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCarById(carId)
      .then((result) => {
        if (!alive) return;
        setCar(result);
        if (result?.color) setForm((current) => ({ ...current, color: current.color || result.color }));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [carId]);

  useEffect(() => {
    if (created) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [created]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validateStep = (index) => {
    const nextErrors = {};

    if (index === 0) {
      if (form.name.trim().length < 3) nextErrors.name = 'Please enter your full name.';
      const digits = phoneDigits(form.phone);
      if (!/^(?:\+?92|0)?3\d{9}$/.test(digits)) {
        nextErrors.phone = 'Enter a valid mobile number, e.g. 0300 1234567.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        nextErrors.email = 'Enter a valid email address.';
      }
      if (form.cnic.trim() && phoneDigits(form.cnic).length !== 13) {
        nextErrors.cnic = 'CNIC must contain 13 digits (optional).';
      }
      if (!form.city) nextErrors.city = 'Select your city.';
    }

    if (index === 1 && !isFull && !TOKEN_OPTIONS.includes(Number(form.tokenAmount))) {
      nextErrors.tokenAmount = 'Choose a pre-booking token amount.';
    }

    if (index === 2) {
      if (!form.color) nextErrors.color = 'Choose a preferred colour.';
      if (!form.visitDate) {
        nextErrors.visitDate = 'Choose a preferred visit date.';
      } else if (form.visitDate < todayString()) {
        nextErrors.visitDate = 'Please choose today or a future date.';
      }
      if (isFull && form.delivery === 'Delivery' && form.address.trim().length < 10) {
        nextErrors.address = 'Please enter a complete delivery address.';
      }
    }

    if (index === 3 && !form.agree) {
      nextErrors.agree = 'Please acknowledge the demo booking terms.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast(nextErrors[Object.keys(nextErrors)[0]], 'error');
      return false;
    }
    return true;
  };

  const goTo = (nextStep) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
    requestAnimationFrame(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) goTo(step + 1);
  };

  const previousStep = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((current) => current - 1);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validateStep(3)) return;
    setSubmitting(true);
    try {
      const booking = await createBooking({
        carId: car.id,
        type: isFull ? 'FullBooking' : 'PreBooking',
        tokenAmount: isFull ? 0 : Number(form.tokenAmount),
        paymentMethod: form.paymentMethod,
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          cnic: form.cnic,
          city: form.city,
          address: form.address,
        },
        preferences: {
          color: form.color,
          delivery: form.delivery,
          visitDate: form.visitDate,
        },
      });
      setCreated(booking);
    } catch {
      showToast('Something went wrong while saving the demo booking. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(created.reference);
      showToast('Booking reference copied.');
    } catch {
      showToast(created.reference, 'info');
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta
          title={isFull ? 'Book a Car' : 'Pre-Book a Car'}
          description="Complete your demo car booking at Motora Car Dealers."
        />
        <div className="container-page py-16">
          <div className="skeleton h-8 w-64" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="skeleton h-[520px] w-full rounded-card" />
            <div className="skeleton h-[420px] w-full rounded-card" />
          </div>
        </div>
      </>
    );
  }

  if (!car) {
    return (
      <>
        <PageMeta title="Vehicle not found" description="This vehicle is not available for booking." />
        <div className="container-page py-20">
          <EmptyState
            title="We couldn't find that car"
            description="The vehicle may have been removed from the demo showroom. Please choose another car."
            action={<Link to="/cars" className="btn-primary">Browse cars</Link>}
          />
        </div>
      </>
    );
  }

  if (car.status === 'Sold') {
    return (
      <>
        <PageMeta title="Vehicle sold" description="This demo vehicle has been sold." />
        <div className="container-page py-20">
          <EmptyState
            title="This car has just been sold"
            description="Explore our available inventory to find a similar car you can book today."
            action={<Link to="/cars" className="btn-primary">Browse available cars</Link>}
          />
        </div>
      </>
    );
  }

  const pageTitle = isFull ? 'Book your new car.' : 'Reserve it with a token.';
  const stepMeta = STEPS[step];

  if (created) {
    return (
      <>
        <PageMeta
          title={`Booking Confirmed — ${created.reference}`}
          description="Your demo booking at Motora Car Dealers has been recorded. This is a simulated booking."
        />
        <section className="relative overflow-hidden bg-mist pb-16 pt-10 md:pb-24 md:pt-14">
          <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-racing/[0.06] blur-3xl" />
          <div className="container-page relative max-w-4xl">
            <div className="relative overflow-hidden rounded-[24px] border border-ink/[0.07] bg-white px-5 pb-8 pt-12 text-center shadow-lift sm:px-10 sm:pb-12 sm:pt-14">
              <Confetti />
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/15" />
                <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                  <motion.path
                    d="M9 21.2l7.3 7.3L31.5 13"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.55, delay: 0.25 }}
                  />
                </svg>
              </motion.div>

              <span className="eyebrow relative mt-6 inline-flex text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {isFull ? 'Booking confirmed' : 'Pre-booking confirmed'}
              </span>
              <h1 className="heading-lg relative mt-3">
                {isFull ? 'You’re all set.' : 'Your car is reserved.'}
              </h1>
              <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/55">
                {isFull
                  ? `Your demo booking for the ${car.name} has been recorded. Confirmation sent (demo) — no real email or SMS was dispatched.`
                  : `Your demo pre-booking for the ${car.name} is saved. Our team would normally contact you within 24 hours to arrange the next step.`}
              </p>

              <div className="relative mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-ink/20 bg-mist/60 px-5 py-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink/35">Your booking reference</p>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <p className="font-display text-xl font-extrabold tracking-[0.08em] sm:text-2xl">{created.reference}</p>
                  <button
                    type="button"
                    onClick={copyReference}
                    className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 bg-white text-ink/50 transition hover:border-ink hover:text-ink"
                    aria-label="Copy booking reference"
                  >
                    <FiCopy size={13} />
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-ink/40">Use this code to track your booking at any time.</p>
              </div>

              <div className="relative mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-2">
                <div className="rounded-xl bg-mist px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink/35">Vehicle</p>
                  <p className="mt-1 text-xs font-semibold">{car.name}</p>
                </div>
                <div className="rounded-xl bg-mist px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink/35">Status</p>
                  <p className="mt-1 text-xs font-semibold text-racing">{created.status}</p>
                </div>
                <div className="rounded-xl bg-mist px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink/35">Amount</p>
                  <p className="mt-1 text-xs font-semibold">
                    {isFull ? formatPKR(car.price) : formatPKR(created.tokenAmount)}
                  </p>
                </div>
                <div className="rounded-xl bg-mist px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink/35">Preferred visit</p>
                  <p className="mt-1 text-xs font-semibold">{created.preferences.visitDate ? formatDate(created.preferences.visitDate) : '—'}</p>
                </div>
              </div>

              <div className="relative mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
                <Link to="/track" className="btn-primary">
                  Track my booking <FiArrowRight />
                </Link>
                <Link to={`/cars/${car.id}`} className="btn-outline">
                  Back to vehicle
                </Link>
                <Link to="/cars" className="btn-outline">
                  Browse more cars
                </Link>
              </div>

              <div className="demo-note relative mx-auto mt-8 max-w-lg text-left">
                <FiInfo size={14} className="mt-0.5 shrink-0 text-gold" />
                <p>
                  This is a frontend demo. No payment was processed, no vehicle was reserved
                  for real, and no email or SMS was sent. Your booking is stored only in this browser.
                </p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const colors = [...new Set([car.color, 'Pearl White', 'Obsidian Black', 'Silver Metallic', 'Any available'])];

  return (
    <>
      <PageMeta
        title={isFull ? `Book ${car.name}` : `Pre-Book ${car.name}`}
        description={`${isFull ? 'Complete a full demo booking' : 'Reserve with a demo token'} for the ${car.year} ${car.name} at Motora Car Dealers.`}
        image={car.images?.[0]}
      />

      <section className="relative overflow-hidden bg-ink pb-16 pt-12 text-white md:pb-20 md:pt-16">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-racing/10 blur-[100px]" />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/35">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <span>/</span>
            <Link to={`/cars/${car.id}`} className="max-w-[160px] truncate transition hover:text-white sm:max-w-none">{car.name}</Link>
            <span>/</span>
            <span className="text-white/70">{isFull ? 'Book' : 'Pre-Book'}</span>
          </nav>
          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="eyebrow text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-racing" />
                {isFull ? 'Full booking' : 'Online pre-booking'}
              </span>
              <h1 className="heading-lg mt-3">{pageTitle}</h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/45">
                {isFull
                  ? 'Choose how you would like to pay, add your delivery preferences and confirm your demo booking.'
                  : 'Secure this vehicle with a demo token amount. No real payment is taken at any step.'}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 pr-5 backdrop-blur-sm">
              <SmartImage
                src={car.images?.[0]}
                alt={car.name}
                className="h-14 w-20 shrink-0 rounded-lg"
              />
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/35">{car.brand}</p>
                <p className="mt-1 text-xs font-semibold">{car.name}</p>
                <p className="mt-1 font-display text-sm font-extrabold text-white/85">{formatPKR(car.price)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-10 md:py-14">
        <div className="container-page">
          <div className="mb-8 rounded-card border border-ink/[0.06] bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
                Step {step + 1} of {STEPS.length}
              </p>
              <span className="text-[10px] font-semibold text-racing">{stepMeta.label}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
              <motion.div
                className="h-full rounded-full bg-racing"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <ol className="mt-5 grid grid-cols-4 gap-2">
              {STEPS.map((item, index) => {
                const Icon = item.icon;
                const complete = index < step;
                const active = index === step;
                return (
                  <li key={item.label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
                    <button
                      type="button"
                      onClick={() => index < step && goTo(index)}
                      disabled={index > step}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] transition ${
                        active
                          ? 'border-racing bg-racing text-white'
                          : complete
                            ? 'cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-ink/10 bg-white text-ink/30'
                      }`}
                      aria-label={`${item.label}${complete ? ' — completed' : active ? ' — current' : ''}`}
                    >
                      {complete ? <FiCheck size={13} /> : <Icon size={13} />}
                    </button>
                    <span
                      className={`hidden text-[10px] font-semibold uppercase tracking-[0.1em] sm:block ${
                        active ? 'text-ink' : complete ? 'text-emerald-700' : 'text-ink/35'
                      }`}
                    >
                      {item.short}
                    </span>
                    <span className={`text-[9px] font-medium sm:hidden ${active ? 'text-ink' : 'text-ink/35'}`}>
                      {item.short}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
            <form onSubmit={submit} noValidate className="overflow-hidden rounded-card border border-ink/[0.06] bg-white shadow-soft">
              <div className="border-b border-ink/[0.07] px-6 py-5 sm:px-8">
                <h2 className="font-display text-xl font-bold">{stepMeta.label}</h2>
                <p className="mt-1 text-xs text-ink/45">
                  {step === 0 && 'Tell us who should receive the booking and how we can reach you.'}
                  {step === 1 && (isFull ? 'Choose how you would like to pay. This is a simulated step.' : 'Choose the token amount that reserves your car. This is a demo only.')}
                  {step === 2 && 'Pick your colour and tell us when you would like to visit or take delivery.'}
                  {step === 3 && 'Check everything below before confirming your demo booking.'}
                </p>
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-7">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -22 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 0 && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Full name" id="name" error={errors.name} className="sm:col-span-2">
                          <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            value={form.name}
                            onChange={(event) => update('name', event.target.value)}
                            placeholder="e.g. Ahmed Raza"
                            className={`input-field ${errors.name ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.name)}
                          />
                        </Field>
                        <Field label="Phone number" id="phone" error={errors.phone} hint="We'll use this only for this demo.">
                          <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            value={form.phone}
                            onChange={(event) => update('phone', event.target.value)}
                            placeholder="0300 1234567"
                            className={`input-field ${errors.phone ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.phone)}
                          />
                        </Field>
                        <Field label="Email address" id="email" error={errors.email}>
                          <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(event) => update('email', event.target.value)}
                            placeholder="you@example.com"
                            className={`input-field ${errors.email ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.email)}
                          />
                        </Field>
                        <Field label="CNIC (optional)" id="cnic" error={errors.cnic} hint="Optional for this demo.">
                          <input
                            id="cnic"
                            type="text"
                            inputMode="numeric"
                            value={form.cnic}
                            onChange={(event) => update('cnic', event.target.value)}
                            placeholder="35202-1234567-8"
                            className={`input-field ${errors.cnic ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.cnic)}
                          />
                        </Field>
                        <Field label="City" id="city" error={errors.city}>
                          <select
                            id="city"
                            value={form.city}
                            onChange={(event) => update('city', event.target.value)}
                            className={`select-field ${errors.city ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.city)}
                          >
                            <option value="">Select your city</option>
                            {CITIES.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    )}

                    {step === 1 && !isFull && (
                      <div>
                        <fieldset>
                          <legend className="sr-only">Choose a token amount</legend>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {TOKEN_OPTIONS.map((amount) => {
                              const active = Number(form.tokenAmount) === amount;
                              return (
                                <button
                                  key={amount}
                                  type="button"
                                  onClick={() => update('tokenAmount', amount)}
                                  className={`relative rounded-xl border-2 p-4 text-left transition ${
                                    active ? 'border-racing bg-racing/[0.03]' : 'border-ink/10 hover:border-ink/25'
                                  }`}
                                  aria-pressed={active}
                                >
                                  <span className={`absolute right-3 top-3 grid h-4 w-4 place-items-center rounded-full border-2 ${active ? 'border-racing bg-racing text-white' : 'border-ink/15'}`}>
                                    {active && <span className="h-1 w-1 rounded-full bg-white" />}
                                  </span>
                                  <p className="font-display text-lg font-extrabold">{formatPKR(amount)}</p>
                                  <p className="mt-1 text-[10px] uppercase tracking-wider text-ink/40">
                                    {amount === 25000 ? 'Essential' : amount === 50000 ? 'Recommended' : 'Priority'}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                        {errors.tokenAmount && <p className="mt-2 text-[11px] font-medium text-racing">{errors.tokenAmount}</p>}

                        <div className="mt-6 rounded-xl bg-mist/70 p-4">
                          <div className="flex items-start gap-3">
                            <FiLock size={16} className="mt-0.5 shrink-0 text-racing" />
                            <div>
                              <p className="text-xs font-semibold">No real payment is collected.</p>
                              <p className="mt-1 text-[11px] leading-relaxed text-ink/50">
                                In a real showroom, your token would hold the car for a limited time.
                                This demo simply records your choice in the browser.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-xl border border-ink/10 px-4 py-3">
                          <span className="text-[11px] text-ink/45">Remaining balance (illustrative)</span>
                          <span className="text-xs font-semibold">{formatPKR(Math.max(car.price - Number(form.tokenAmount), 0))}</span>
                        </div>
                      </div>
                    )}

                    {step === 1 && isFull && (
                      <fieldset>
                        <legend className="sr-only">Choose a payment method</legend>
                        <div className="space-y-3">
                          {PAYMENT_METHODS.map((method) => {
                            const Icon = method.icon;
                            const active = form.paymentMethod === method.value;
                            return (
                              <button
                                key={method.value}
                                type="button"
                                onClick={() => update('paymentMethod', method.value)}
                                className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition ${
                                  active ? 'border-racing bg-racing/[0.03]' : 'border-ink/10 hover:border-ink/25'
                                }`}
                                aria-pressed={active}
                              >
                                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${active ? 'bg-racing text-white' : 'bg-mist text-ink/50'}`}>
                                  <Icon size={17} />
                                </span>
                                <span className="flex-1">
                                  <span className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold">{method.label}</span>
                                    <span className={`grid h-4 w-4 place-items-center rounded-full border-2 ${active ? 'border-racing bg-racing text-white' : 'border-ink/15'}`}>
                                      {active && <span className="h-1 w-1 rounded-full bg-white" />}
                                    </span>
                                  </span>
                                  <span className="mt-1 block text-[11px] leading-relaxed text-ink/45">{method.description}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="demo-note mt-5">
                          <FiInfo size={14} className="mt-0.5 shrink-0 text-gold" />
                          <p>
                            Payment is simulated. Selecting a method does not charge you or
                            send any payment request. Full booking amount shown in the summary.
                          </p>
                        </div>
                      </fieldset>
                    )}

                    {step === 2 && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Preferred colour" id="color" error={errors.color}>
                          <select
                            id="color"
                            value={form.color}
                            onChange={(event) => update('color', event.target.value)}
                            className={`select-field ${errors.color ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.color)}
                          >
                            <option value="">Select a colour</option>
                            {colors.map((color) => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Preferred visit date" id="visitDate" error={errors.visitDate}>
                          <input
                            id="visitDate"
                            type="date"
                            min={todayString()}
                            value={form.visitDate}
                            onChange={(event) => update('visitDate', event.target.value)}
                            className={`input-field ${errors.visitDate ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.visitDate)}
                          />
                        </Field>
                        <div className="sm:col-span-2">
                          <span className="input-label">Delivery preference</span>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {[
                              { value: 'Pickup', label: 'Showroom pickup', description: 'Collect from our Lahore showroom', icon: FiHome },
                              { value: 'Delivery', label: 'Home delivery', description: 'Doorstep delivery (demo)', icon: FiTruck },
                            ].map((option) => {
                              const Icon = option.icon;
                              const active = form.delivery === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => update('delivery', option.value)}
                                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition ${
                                    active ? 'border-racing bg-racing/[0.03]' : 'border-ink/10 hover:border-ink/25'
                                  }`}
                                  aria-pressed={active}
                                >
                                  <Icon size={17} className={active ? 'text-racing' : 'text-ink/35'} />
                                  <span>
                                    <span className="block text-xs font-semibold">{option.label}</span>
                                    <span className="mt-0.5 block text-[10px] text-ink/40">{option.description}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {isFull && form.delivery === 'Delivery' && (
                          <Field
                            label="Delivery address"
                            id="address"
                            error={errors.address}
                            className="sm:col-span-2"
                          >
                            <textarea
                              id="address"
                              rows="3"
                              value={form.address}
                              onChange={(event) => update('address', event.target.value)}
                              placeholder="House / street / area, city"
                              className={`input-field resize-none ${errors.address ? 'border-racing' : ''}`}
                              aria-invalid={Boolean(errors.address)}
                            />
                          </Field>
                        )}

                        <div className="sm:col-span-2 rounded-xl bg-mist/70 p-4">
                          <p className="flex items-center gap-2 text-[11px] font-semibold text-ink/60">
                            <FiCalendar size={13} className="text-racing" />
                            Pickup and delivery dates are confirmed by the team in a live dealership.
                          </p>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-5">
                        <div className="rounded-xl border border-ink/[0.08]">
                          <div className="flex items-center justify-between border-b border-ink/[0.07] px-4 py-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">Your details</h3>
                            <button type="button" onClick={() => goTo(0)} className="text-[10px] font-semibold text-racing">Edit</button>
                          </div>
                          <dl className="grid gap-3 px-4 py-4 text-xs sm:grid-cols-2">
                            <div><dt className="text-ink/35">Name</dt><dd className="mt-1 font-semibold">{form.name}</dd></div>
                            <div><dt className="text-ink/35">Phone</dt><dd className="mt-1 font-semibold">{form.phone}</dd></div>
                            <div><dt className="text-ink/35">Email</dt><dd className="mt-1 break-all font-semibold">{form.email}</dd></div>
                            <div><dt className="text-ink/35">City</dt><dd className="mt-1 font-semibold">{form.city}</dd></div>
                            {form.cnic && <div><dt className="text-ink/35">CNIC</dt><dd className="mt-1 font-semibold">{form.cnic}</dd></div>}
                          </dl>
                        </div>

                        <div className="rounded-xl border border-ink/[0.08]">
                          <div className="flex items-center justify-between border-b border-ink/[0.07] px-4 py-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                              {isFull ? 'Payment' : 'Token'}
                            </h3>
                            <button type="button" onClick={() => goTo(1)} className="text-[10px] font-semibold text-racing">Edit</button>
                          </div>
                          <dl className="grid gap-3 px-4 py-4 text-xs sm:grid-cols-2">
                            <div>
                              <dt className="text-ink/35">{isFull ? 'Payment method' : 'Token amount'}</dt>
                              <dd className="mt-1 font-semibold">
                                {isFull ? form.paymentMethod : formatPKR(form.tokenAmount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-ink/35">{isFull ? 'Full booking value' : 'Balance (illustrative)'}</dt>
                              <dd className="mt-1 font-semibold">
                                {isFull ? formatPKR(car.price) : formatPKR(Math.max(car.price - Number(form.tokenAmount), 0))}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="rounded-xl border border-ink/[0.08]">
                          <div className="flex items-center justify-between border-b border-ink/[0.07] px-4 py-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">Preferences</h3>
                            <button type="button" onClick={() => goTo(2)} className="text-[10px] font-semibold text-racing">Edit</button>
                          </div>
                          <dl className="grid gap-3 px-4 py-4 text-xs sm:grid-cols-2">
                            <div><dt className="text-ink/35">Colour</dt><dd className="mt-1 font-semibold">{form.color}</dd></div>
                            <div><dt className="text-ink/35">Visit date</dt><dd className="mt-1 font-semibold">{formatDate(form.visitDate)}</dd></div>
                            <div><dt className="text-ink/35">Handover</dt><dd className="mt-1 font-semibold">{form.delivery}</dd></div>
                            {form.delivery === 'Delivery' && form.address && (
                              <div><dt className="text-ink/35">Address</dt><dd className="mt-1 font-semibold">{form.address}</dd></div>
                            )}
                          </dl>
                        </div>

                        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition ${errors.agree ? 'border-racing bg-racing/[0.02]' : 'border-ink/10'}`}>
                          <input
                            type="checkbox"
                            checked={form.agree}
                            onChange={(event) => update('agree', event.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#E10600]"
                          />
                          <span className="text-[11px] leading-relaxed text-ink/55">
                            I understand this is a demo booking. No real vehicle will be reserved,
                            no payment will be processed, and all information is stored locally in this browser.
                          </span>
                        </label>
                        {errors.agree && <p className="text-[11px] font-medium text-racing">{errors.agree}</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-ink/[0.07] bg-mist/40 px-6 py-4 sm:px-8">
                {step > 0 ? (
                  <button type="button" onClick={previousStep} className="btn-outline border-ink/10 bg-white">
                    <FiArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <Link to={`/cars/${car.id}`} className="inline-flex items-center gap-2 text-xs font-medium text-ink/40 transition hover:text-ink">
                    <FiArrowLeft size={14} /> Back to car
                  </Link>
                )}

                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={nextStep} className="btn-primary">
                    Continue <FiArrowRight size={15} />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting} className="btn-primary min-w-[180px]">
                    {submitting ? (
                      <>
                        <FiLoader className="animate-spin" size={15} /> Confirming…
                      </>
                    ) : (
                      <>
                        Confirm {isFull ? 'booking' : 'pre-booking'} <FiCheck size={15} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            <aside className="space-y-4 lg:sticky lg:top-[118px]">
              <div className="overflow-hidden rounded-card border border-ink/[0.07] bg-white shadow-soft">
                <SmartImage
                  src={car.images?.[0]}
                  alt={car.name}
                  className="h-36 w-full"
                />
                <div className="p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-racing">{car.brand} · {car.condition}</p>
                  <h2 className="mt-2 font-display text-base font-bold leading-snug">{car.name}</h2>
                  <p className="mt-1 text-[11px] text-ink/40">{car.year} · {car.mileage === 0 ? '0 km' : `${car.mileage.toLocaleString()} km`} · {car.transmission}</p>

                  <div className="mt-5 space-y-3 border-t border-ink/[0.07] pt-4 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-ink/45">Vehicle price</span>
                      <span className="text-right font-semibold">{formatPKR(car.price)}</span>
                    </div>
                    {isFull ? (
                      <>
                        <div className="flex justify-between gap-3">
                          <span className="text-ink/45">Payment method</span>
                          <span className="text-right font-semibold">{form.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-ink/[0.07] pt-3">
                          <span className="font-semibold">Booking value</span>
                          <span className="text-right font-display font-extrabold text-racing">{formatPKR(car.price)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between gap-3">
                          <span className="text-ink/45">Token amount</span>
                          <span className="text-right font-semibold">{formatPKR(form.tokenAmount)}</span>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-ink/[0.07] pt-3">
                          <span className="font-semibold">Balance later</span>
                          <span className="text-right font-display font-extrabold text-racing">
                            {formatPKR(Math.max(car.price - Number(form.tokenAmount), 0))}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-5 space-y-2.5 border-t border-ink/[0.07] pt-4">
                    {[
                      { icon: FiShieldIcon, text: 'Fully refundable in a live showroom' },
                      { icon: FiLock, text: 'Secure demo booking' },
                      { icon: FiCheckCircle, text: 'No real payment taken' },
                    ].map(({ icon: Icon, text }) => (
                      <p key={text} className="flex items-center gap-2 text-[10px] text-ink/45">
                        <Icon size={12} className="shrink-0 text-emerald-600" />
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="demo-note bg-white">
                <FiInfo size={14} className="mt-0.5 shrink-0 text-gold" />
                <p>
                  You are on a demo booking flow. Steps, references and confirmations
                  are simulated and saved to this browser only.
                </p>
              </div>

              <div className="rounded-card border border-ink/[0.07] bg-white p-4 shadow-soft">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                  <FiMapPin size={12} className="text-racing" /> Motora Showroom
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-ink/50">
                  Main Boulevard, Gulberg III, Lahore<br />
                  Open Mon–Sat, 10am–8pm
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

// Small wrapper keeps the trust-icon list readable without another dependency.
function FiShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={props.size || 16} height={props.size || 16} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
