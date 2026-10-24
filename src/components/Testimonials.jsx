import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiStar } from 'react-icons/fi';
import { getTestimonials } from '../services/api';
import { Reveal, SectionHeading, Stars } from './ui';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getTestimonials()
      .then((data) => {
        if (alive) setTestimonials(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const next = () => setActive((current) => (current + 1) % testimonials.length);
  const prev = () => setActive((current) => (current - 1 + testimonials.length) % testimonials.length);
  const testimonial = testimonials[active];

  return (
    <section className="section-pad bg-mist">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Owner stories"
              title={<>Trusted by people<br className="hidden sm:block" /> who love cars.</>}
              description="Real words from demo customers who found their next car with Motora. Every review shown here is sample content."
            />
            <Reveal delay={0.15} className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                {['ZQ', 'DH', 'MS', 'OF'].map((initials, index) => (
                  <span
                    key={initials}
                    className={`grid h-10 w-10 place-items-center rounded-full border-2 border-mist text-[10px] font-bold text-white ${
                      ['bg-racing', 'bg-ink', 'bg-gold text-ink', 'bg-[#3a3a46]'][index]
                    }`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div>
                <Stars />
                <p className="mt-1 text-[11px] text-ink/45">4.9 average · 1,200+ demo reviews</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-[24px] border border-ink/[0.06] bg-white p-7 shadow-soft sm:p-10">
              <span className="pointer-events-none absolute -right-4 -top-10 font-display text-[180px] font-black leading-none text-racing/[0.06]">
                “
              </span>
              <div className="relative min-h-[260px] sm:min-h-[220px]">
                {loading ? (
                  <div className="space-y-4">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-11/12" />
                    <div className="skeleton h-4 w-10/12" />
                    <div className="skeleton mt-8 h-12 w-52" />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {testimonial && (
                      <motion.figure
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Stars count={testimonial.rating} />
                        <blockquote className="mt-5 font-display text-xl font-semibold leading-relaxed tracking-tight text-ink/85 sm:text-2xl">
                          “{testimonial.quote}”
                        </blockquote>
                        <figcaption className="mt-7 flex items-center justify-between border-t border-ink/[0.08] pt-5">
                          <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                              {testimonial.initials}
                            </span>
                            <div>
                              <p className="text-sm font-semibold">{testimonial.name}</p>
                              <p className="mt-0.5 text-[11px] text-ink/45">{testimonial.role}</p>
                            </div>
                          </div>
                          <span className="hidden items-center gap-1 rounded-full bg-mist px-3 py-1.5 text-[10px] font-semibold text-ink/45 sm:flex">
                            <FiStar size={11} className="text-gold" fill="currentColor" />
                            Verified demo
                          </span>
                        </figcaption>
                      </motion.figure>
                    )}
                  </AnimatePresence>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex gap-1.5" role="tablist" aria-label="Testimonials">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`Show testimonial ${index + 1}`}
                      aria-selected={index === active}
                      role="tab"
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === active ? 'w-7 bg-racing' : 'w-1.5 bg-ink/15 hover:bg-ink/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous testimonial"
                    className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 transition hover:border-ink hover:bg-ink hover:text-white"
                  >
                    <FiArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next testimonial"
                    className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 transition hover:border-ink hover:bg-ink hover:text-white"
                  >
                    <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
