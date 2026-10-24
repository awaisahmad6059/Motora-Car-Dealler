import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiCheck,
  FiClock,
  FiCreditCard,
  FiShield,
  FiSmile,
  FiTruck,
  FiUsers,
} from 'react-icons/fi';
import Hero from '../components/Hero';
import Testimonials from '../components/Testimonials';
import CarCard from '../components/CarCard';
import SmartImage from '../components/SmartImage';
import { CarCardSkeleton } from '../components/Skeletons';
import { AnimatedStat, LinkArrow, Reveal, SectionHeading } from '../components/ui';
import PageMeta from '../components/PageMeta';
import { formatPKR, getFeaturedCars, getNewArrivals } from '../services/api';

const brands = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Hyundai', 'Kia', 'MG', 'Suzuki'];

const reasons = [
  {
    icon: FiShield,
    title: 'Certified Cars',
    description: 'Every pre-owned vehicle passes a 200-point inspection and comes with a transparent condition report.',
    tag: '200-point check',
  },
  {
    icon: FiCreditCard,
    title: 'Easy Finance',
    description: 'Flexible plans, competitive demo rates and a calculator that shows you the real monthly picture.',
    tag: 'Up to 7 years',
  },
  {
    icon: FiAward,
    title: 'Real Warranty',
    description: 'Drive with confidence thanks to a complimentary warranty on certified cars and clear coverage terms.',
    tag: '1-year cover',
  },
  {
    icon: FiTruck,
    title: 'Home Delivery',
    description: 'Complete your booking online and choose doorstep delivery anywhere in Lahore, Karachi or Islamabad.',
    tag: 'Nationwide',
  },
];

const stats = [
  { icon: FiAward, value: 4800, suffix: '+', label: 'Cars sold' },
  { icon: FiUsers, value: 3200, suffix: '+', label: 'Happy customers' },
  { icon: FiClock, value: 15, suffix: ' yrs', label: 'Years of experience' },
  { icon: FiSmile, value: 98, suffix: '%', label: 'Would recommend us' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getFeaturedCars(6), getNewArrivals(6)])
      .then(([featuredCars, newCars]) => {
        if (!alive) return;
        setFeatured(featuredCars);
        setArrivals(newCars);
      })
      .catch(() => {
        if (!alive) return;
        setFeatured([]);
        setArrivals([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const scrollSlider = (direction) => {
    sliderRef.current?.scrollBy({ left: direction * 344, behavior: 'smooth' });
  };

  return (
    <>
      <PageMeta
        title="Premium Cars & Online Booking"
        description="Explore new and used cars at Motora Car Dealers. Pre-book online, estimate finance and find your next premium car. Demo website."
        image="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
      />
      <Hero />

      <section aria-label="Featured brands" className="border-b border-ink/[0.07] bg-white">
        <div className="container-page py-6">
          <div className="flex items-center gap-7 overflow-hidden">
            <span className="hidden shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-ink/30 md:block">
              Trusted marques
            </span>
            <div className="hide-scrollbar flex flex-1 items-center justify-between gap-7 overflow-x-auto">
              {brands.map((brand) => (
                <span
                  key={brand}
                  className="shrink-0 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ink/30 transition-colors hover:text-ink/60"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Curated inventory"
            title={<>Featured cars,<br className="hidden sm:block" /> chosen for the drive.</>}
            description="A tight edit of our best new and pre-owned vehicles. Every listing includes full specifications, transparent pricing and a fast online reservation."
            action={<LinkArrow to="/cars">View all cars</LinkArrow>}
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <CarCardSkeleton count={6} />
            ) : (
              featured.map((car, index) => <CarCard key={car.id} car={car} index={index} />)
            )}
          </div>

          <Reveal className="mt-10 flex justify-center" delay={0.1}>
            <Link to="/cars" className="btn-outline">
              Explore the full collection <FiArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section-pad relative overflow-hidden bg-mist">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-racing/[0.05] blur-3xl" />
        <div className="container-page relative">
          <SectionHeading
            eyebrow="Why Motora"
            title={<>The details make<br className="hidden sm:block" /> the difference.</>}
            description="A dealership experience designed to feel as considered as the cars we sell. No pressure, no surprises — just clear answers and a better way to buy."
            action={
              <Link to="/contact" className="btn-dark">
                Talk to a specialist
              </Link>
            }
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <Reveal key={reason.title} delay={index * 0.08}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="group relative h-full overflow-hidden rounded-card border border-ink/[0.06] bg-white p-6 shadow-soft transition-shadow hover:shadow-lift"
                  >
                    <span className="absolute right-5 top-5 font-display text-[11px] font-bold tracking-wider text-ink/15">
                      0{index + 1}
                    </span>
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-white transition-colors duration-300 group-hover:bg-racing">
                      <Icon size={21} />
                    </span>
                    <h3 className="mt-7 font-display text-lg font-bold">{reason.title}</h3>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-ink/55">{reason.description}</p>
                    <div className="mt-6 flex items-center gap-2 border-t border-ink/[0.07] pt-4">
                      <FiCheck size={12} className="text-racing" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                        {reason.tag}
                      </span>
                    </div>
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-racing transition-all duration-500 group-hover:w-full" />
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-16 text-white md:py-24">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-racing/[0.09] blur-[100px]" />
        <div className="container-page relative">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <span className="eyebrow mb-4 text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-racing" />
                Just landed
              </span>
              <h2 className="heading-lg text-white">Latest models.</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/45">
                Freshly arrived for 2026 and ready to reserve. Swipe through the newest
                metal in the Motora showroom.
              </p>
            </Reveal>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollSlider(-1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Scroll latest models left"
              >
                <FiArrowLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => scrollSlider(1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Scroll latest models right"
              >
                <FiArrowRight size={17} />
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="hide-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3"
          >
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="w-[300px] shrink-0">
                    <div className="skeleton h-72 w-full bg-white/10" />
                  </div>
                ))
              : arrivals.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className="w-[290px] shrink-0 snap-start sm:w-[330px]"
                  >
                    <CarCard car={car} index={index} compact />
                  </motion.div>
                ))}
          </div>

          <div className="mt-7">
            <LinkArrow to="/cars?condition=New" light>
              See all new arrivals
            </LinkArrow>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/10 bg-carbon">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-racing to-transparent" />
        <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 md:py-16">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <AnimatedStat {...stat} light />
            </Reveal>
          ))}
        </div>
      </section>

      <Testimonials />

      <section className="bg-white py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-[24px] bg-ink text-white">
              <div className="absolute inset-0">
                <SmartImage
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1800&q=80"
                  alt=""
                  className="h-full w-full"
                  imgClassName="opacity-35 object-[70%_center]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/20" />
              </div>
              <div className="relative max-w-xl px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
                <span className="eyebrow text-white/45">Your move</span>
                <h2 className="heading-lg mt-4 text-balance text-white">
                  Your next car is waiting in the showroom.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/50">
                  Browse the collection, reserve with a token amount or complete a full
                  demo booking in minutes. No real payment required.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/cars" className="btn-primary">
                    Find your car <FiArrowRight />
                  </Link>
                  <Link to="/finance" className="btn-ghost">
                    Estimate finance
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
