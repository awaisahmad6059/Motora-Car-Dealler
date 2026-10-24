import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiInfo,
  FiLoader,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSend,
  FiShield,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import PageMeta from '../components/PageMeta';
import { useToast } from '../components/Toast';
import { createEnquiry } from '../services/api';
import { Reveal } from '../components/ui';

const initialForm = { name: '', email: '', phone: '', message: '' };
const phoneDigits = (value) => String(value || '').replace(/\D/g, '');

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!/^(?:\+?92|0)?3\d{9}$/.test(phoneDigits(form.phone))) {
      nextErrors.phone = 'Enter a valid mobile number.';
    }
    if (form.message.trim().length < 10) nextErrors.message = 'Tell us a little more (at least 10 characters).';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createEnquiry(form);
      setSubmitted(true);
      setForm(initialForm);
      showToast('Demo enquiry saved successfully.');
    } catch {
      showToast('Could not save your enquiry. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Contact Us"
        description="Get in touch with Motora Car Dealers. Visit our Lahore demo showroom, call us, or send an enquiry online. Demo website."
      />

      <section className="relative overflow-hidden bg-ink pb-20 pt-12 text-white md:pb-28 md:pt-16">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-racing/[0.09] blur-[100px]" />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/35">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/70">Contact</span>
          </nav>
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span className="eyebrow text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-racing" />
                Get in touch
              </span>
              <h1 className="heading-xl mt-4">Let’s talk cars.</h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/45">
                Questions about a vehicle, finance or a test drive? Send us a note and
                our demo team will point you in the right direction.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[10px] text-white/50">
                <FiClock size={12} className="text-gold" /> Replies within 24 hours
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[10px] text-white/50">
                <FiShield size={12} className="text-emerald-400" /> No spam, ever
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist pb-16 pt-10 md:pb-24 md:pt-14">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <Reveal>
              <div className="overflow-hidden rounded-card border border-ink/[0.06] bg-white shadow-soft">
                <div className="border-b border-ink/[0.07] p-6 sm:p-8">
                  <span className="eyebrow">Send a message</span>
                  <h2 className="mt-3 font-display text-2xl font-bold">How can we help?</h2>
                  <p className="mt-2 text-xs leading-relaxed text-ink/45">
                    Fill in the form and your enquiry will be saved to the demo admin panel.
                  </p>
                </div>

                <div className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex min-h-[420px] flex-col items-center justify-center text-center"
                      >
                        <motion.span
                          initial={{ scale: 0.7 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                          className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600"
                        >
                          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/15" />
                          <FiCheck size={32} />
                        </motion.span>
                        <h3 className="mt-6 font-display text-2xl font-bold">Message received.</h3>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/50">
                          Your demo enquiry has been saved. In a live showroom, a specialist
                          would reply within one business day.
                        </p>
                        <div className="demo-note mt-6 max-w-sm text-left">
                          <FiInfo size={14} className="mt-0.5 shrink-0 text-gold" />
                          <p>No real email or SMS was sent. This enquiry exists only in your browser.</p>
                        </div>
                        <button type="button" onClick={() => setSubmitted(false)} className="btn-outline mt-6">
                          Send another message <FiArrowRight size={14} />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleSubmit}
                        noValidate
                        className="space-y-5"
                      >
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label htmlFor="contact-name" className="input-label">Full name</label>
                            <input
                              id="contact-name"
                              type="text"
                              autoComplete="name"
                              value={form.name}
                              onChange={(event) => update('name', event.target.value)}
                              placeholder="Your name"
                              className={`input-field ${errors.name ? 'border-racing' : ''}`}
                              aria-invalid={Boolean(errors.name)}
                            />
                            {errors.name && <p className="mt-1.5 text-[11px] font-medium text-racing">{errors.name}</p>}
                          </div>
                          <div>
                            <label htmlFor="contact-phone" className="input-label">Phone number</label>
                            <input
                              id="contact-phone"
                              type="tel"
                              autoComplete="tel"
                              value={form.phone}
                              onChange={(event) => update('phone', event.target.value)}
                              placeholder="0300 1234567"
                              className={`input-field ${errors.phone ? 'border-racing' : ''}`}
                              aria-invalid={Boolean(errors.phone)}
                            />
                            {errors.phone && <p className="mt-1.5 text-[11px] font-medium text-racing">{errors.phone}</p>}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="contact-email" className="input-label">Email address</label>
                          <input
                            id="contact-email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(event) => update('email', event.target.value)}
                            placeholder="you@example.com"
                            className={`input-field ${errors.email ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.email)}
                          />
                          {errors.email && <p className="mt-1.5 text-[11px] font-medium text-racing">{errors.email}</p>}
                        </div>
                        <div>
                          <label htmlFor="contact-message" className="input-label">Message</label>
                          <textarea
                            id="contact-message"
                            rows="6"
                            value={form.message}
                            onChange={(event) => update('message', event.target.value)}
                            placeholder="Tell us what you're looking for — a car, finance, a test drive…"
                            className={`input-field resize-none ${errors.message ? 'border-racing' : ''}`}
                            aria-invalid={Boolean(errors.message)}
                          />
                          <div className="mt-1.5 flex items-center justify-between">
                            {errors.message ? (
                              <p className="text-[11px] font-medium text-racing">{errors.message}</p>
                            ) : (
                              <span className="text-[10px] text-ink/30">Please don't share sensitive payment details.</span>
                            )}
                            <span className="text-[10px] text-ink/30">{form.message.length}/500</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-ink/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-[10px] leading-relaxed text-ink/35">
                            By sending, you agree this is a demo enquiry.
                          </p>
                          <button type="submit" disabled={submitting} className="btn-primary sm:min-w-[170px]">
                            {submitting ? (
                              <><FiLoader className="animate-spin" size={15} /> Sending…</>
                            ) : (
                              <><FiSend size={15} /> Send enquiry</>
                            )}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: FiMapPin,
                    label: 'Visit the showroom',
                    lines: ['Main Boulevard, Gulberg III', 'Lahore, Pakistan'],
                    href: 'https://maps.google.com/?q=Gulberg+III+Lahore',
                  },
                  {
                    icon: FiPhone,
                    label: 'Call us',
                    lines: ['+92 42 111 222 33', 'Mon–Sat, 10am–8pm'],
                    href: 'tel:+924211122233',
                  },
                  {
                    icon: FiMail,
                    label: 'Email us',
                    lines: ['hello@motora.demo', 'Demo inbox only'],
                    href: 'mailto:hello@motora.demo',
                  },
                  {
                    icon: FiClock,
                    label: 'Opening hours',
                    lines: ['Mon–Sat: 10am – 8pm', 'Sun: 12pm – 6pm'],
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <>
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-mist text-racing">
                        <Icon size={15} />
                      </span>
                      <span className="mt-4 block text-[9px] font-bold uppercase tracking-[0.16em] text-ink/35">{item.label}</span>
                      {item.lines.map((line) => (
                        <span key={line} className="mt-1 block text-[11px] leading-relaxed text-ink/60">{line}</span>
                      ))}
                    </>
                  );
                  return item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="rounded-card border border-ink/[0.06] bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={item.label} className="rounded-card border border-ink/[0.06] bg-white p-5 shadow-soft">
                      {content}
                    </div>
                  );
                })}
              </div>

              <a
                href="https://wa.me/923001234567?text=Hi%20Motora%2C%20I%27d%20like%20to%20know%20more%20about%20a%20car."
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 rounded-card border border-emerald-200 bg-emerald-50 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500 text-white">
                    <FaWhatsapp size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-emerald-900">Chat on WhatsApp</span>
                    <span className="mt-0.5 block text-[10px] text-emerald-800/55">Typical reply: under 15 minutes (demo)</span>
                  </span>
                </span>
                <FiArrowRight className="text-emerald-700" />
              </a>

              <div className="relative h-56 overflow-hidden rounded-card border border-ink/[0.07] bg-ink shadow-soft">
                <div className="absolute inset-0 bg-grid opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-br from-racing/5 via-transparent to-gold/5" />
                <div className="absolute left-[15%] top-[40%] h-[3px] w-40 rotate-[24deg] bg-white/10" />
                <div className="absolute right-0 left-0 top-[68%] h-[3px] bg-white/10" />
                <div className="absolute bottom-0 left-[62%] top-0 w-[3px] rotate-[8deg] bg-white/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-racing text-white shadow-[0_0_0_10px_rgba(225,6,0,0.15)]">
                    <FiMapPin size={20} />
                  </span>
                  <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white">
                    Motora Flagship
                  </p>
                  <p className="mt-1 text-[10px] text-white/35">Gulberg III, Lahore</p>
                </div>
                <span className="absolute bottom-3 left-3 rounded-full bg-white/10 px-3 py-1 text-[8px] uppercase tracking-wider text-white/40 backdrop-blur">
                  Map placeholder
                </span>
              </div>

              <div className="demo-note bg-white">
                <FiInfo size={14} className="mt-0.5 shrink-0 text-gold" />
                <p>
                  Contact details are placeholders. This demo does not send emails,
                  SMS or WhatsApp messages.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
