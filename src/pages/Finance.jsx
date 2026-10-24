import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  FiArrowRight,
  FiCheck,
  FiInfo,
  FiPercent,
  FiTrendingUp,
} from 'react-icons/fi';
import PageMeta from '../components/PageMeta';
import { Reveal } from '../components/ui';
import { formatPKR } from '../services/api';

const fmt = (value) => formatPKR(Math.round(value));

function AnimatedMoney({ value, className = '' }) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    const to = value;
    previous.current = value;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(to);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const duration = 380;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className={className}>{fmt(display)}</span>;
}

export default function Finance() {
  const [searchParams] = useSearchParams();
  const initialPrice = Number(searchParams.get('price')) || 8950000;
  const [price, setPrice] = useState(Math.max(initialPrice, 1000000));
  const [down, setDown] = useState(Math.round(initialPrice * 0.2));
  const [rate, setRate] = useState(13.99);
  const [tenure, setTenure] = useState(60);

  const numbers = useMemo(() => {
    const safePrice = Math.max(Number(price) || 0, 0);
    const safeDown = Math.min(Math.max(Number(down) || 0, 0), safePrice);
    const principal = Math.max(safePrice - safeDown, 0);
    const monthlyRate = Math.max(Number(rate) || 0, 0) / 100 / 12;
    const months = Math.max(Number(tenure) || 1, 1);
    let monthly = 0;
    if (principal > 0) {
      monthly =
        monthlyRate === 0
          ? principal / months
          : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
    }
    const totalPayable = monthly * months;
    const totalInterest = Math.max(totalPayable - principal, 0);
    const totalCost = totalPayable + safeDown;
    return {
      safePrice,
      safeDown,
      principal,
      monthly,
      totalPayable,
      totalInterest,
      totalCost,
    };
  }, [price, down, rate, tenure]);

  const chartData = [
    { name: 'Financed amount', value: Math.round(numbers.principal), color: '#0B0B0F' },
    { name: 'Interest', value: Math.round(numbers.totalInterest), color: '#E10600' },
  ];

  const updatePrice = (value) => {
    const next = Math.max(Number(value) || 0, 0);
    setPrice(next);
    setDown((current) => Math.min(current, next));
  };

  const downPct = numbers.safePrice > 0 ? Math.round((numbers.safeDown / numbers.safePrice) * 100) : 0;

  return (
    <>
      <PageMeta
        title="Car Finance Calculator"
        description="Estimate your monthly car instalment with the Motora demo finance calculator. Adjust price, down payment, rate and tenure. No real finance is provided."
      />

      <section className="relative overflow-hidden bg-ink pb-16 pt-12 text-white md:pb-20 md:pt-16">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-gold/[0.06] blur-[100px]" />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/35">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/70">Finance</span>
          </nav>
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span className="eyebrow text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-racing" />
                Finance calculator
              </span>
              <h1 className="heading-xl mt-4">Make the numbers<br className="hidden sm:block" /> make sense.</h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/45">
                See your estimated monthly instalment before you visit the showroom.
                Adjust the numbers below — everything updates live.
              </p>
            </div>
            <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur sm:flex">
              <FiPercent size={19} className="text-gold" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">Sample rate from</p>
                <p className="mt-1 font-display text-lg font-extrabold">13.99% APR</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist pb-16 pt-10 md:pb-24 md:pt-14">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <Reveal>
              <div className="rounded-card border border-ink/[0.06] bg-white p-6 shadow-soft sm:p-8">
                <div className="flex items-center justify-between border-b border-ink/[0.07] pb-5">
                  <div>
                    <h2 className="font-display text-xl font-bold">Your finance details</h2>
                    <p className="mt-1 text-[11px] text-ink/40">All amounts in PKR. Nothing here is a real offer.</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-mist text-racing">
                    <FiTrendingUp size={17} />
                  </span>
                </div>

                <div className="mt-6 space-y-8">
                  <div>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <label htmlFor="car-price" className="input-label">Car price</label>
                        <p className="text-[10px] text-ink/35">The total purchase price of the vehicle.</p>
                      </div>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-ink/35">PKR</span>
                        <input
                          id="car-price"
                          type="number"
                          min="1000000"
                          step="100000"
                          value={price}
                          onChange={(event) => updatePrice(event.target.value)}
                          className="w-40 rounded-lg border border-ink/10 py-2.5 pl-10 pr-2 text-right font-display text-sm font-bold focus:border-racing focus:outline-none focus:ring-4 focus:ring-racing/10"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1000000"
                      max="50000000"
                      step="100000"
                      value={Math.min(price, 50000000)}
                      onChange={(event) => updatePrice(event.target.value)}
                      className="mt-4 w-full"
                      aria-label="Car price slider"
                    />
                    <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wider text-ink/30">
                      <span>1M</span>
                      <span>50M</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <label htmlFor="down-payment" className="input-label">Down payment</label>
                        <p className="text-[10px] text-ink/35">{downPct}% of the car price.</p>
                      </div>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-ink/35">PKR</span>
                        <input
                          id="down-payment"
                          type="number"
                          min="0"
                          max={numbers.safePrice}
                          step="50000"
                          value={numbers.safeDown}
                          onChange={(event) =>
                            setDown(Math.min(Math.max(Number(event.target.value) || 0, 0), numbers.safePrice))
                          }
                          className="w-40 rounded-lg border border-ink/10 py-2.5 pl-10 pr-2 text-right font-display text-sm font-bold focus:border-racing focus:outline-none focus:ring-4 focus:ring-racing/10"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={numbers.safePrice}
                      step="50000"
                      value={numbers.safeDown}
                      onChange={(event) => setDown(Number(event.target.value))}
                      className="mt-4 w-full"
                      aria-label="Down payment slider"
                    />
                  </div>

                  <div className="grid gap-7 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="interest-rate" className="input-label">Interest rate</label>
                        <span className="font-display text-sm font-bold text-racing">{Number(rate).toFixed(2)}%</span>
                      </div>
                      <input
                        id="interest-rate"
                        type="range"
                        min="5"
                        max="25"
                        step="0.25"
                        value={rate}
                        onChange={(event) => setRate(Number(event.target.value))}
                        className="w-full"
                      />
                      <div className="mt-2 flex justify-between text-[9px] text-ink/30">
                        <span>5%</span>
                        <span>25% annual</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="tenure" className="input-label">Tenure</label>
                        <span className="font-display text-sm font-bold text-racing">{tenure} months</span>
                      </div>
                      <select
                        id="tenure"
                        value={tenure}
                        onChange={(event) => setTenure(Number(event.target.value))}
                        className="select-field mt-1 py-2.5 text-xs"
                      >
                        {[12, 24, 36, 48, 60, 72, 84].map((months) => (
                          <option key={months} value={months}>{months} months</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Monthly', value: numbers.monthly },
                      { label: 'Total interest', value: numbers.totalInterest },
                      { label: 'Total cost', value: numbers.totalCost },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-mist/70 px-3 py-3">
                        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-ink/35">{item.label}</p>
                        <p className="mt-1.5 truncate font-display text-[13px] font-extrabold">{fmt(item.value)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="demo-note mt-7">
                  <FiInfo size={14} className="mt-0.5 shrink-0 text-gold" />
                  <p>
                    This calculator is for illustration only. Rates, terms and approvals
                    vary by bank and are not real offers. No finance application is submitted.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="space-y-5 lg:sticky lg:top-[118px]">
              <div className="relative overflow-hidden rounded-card bg-ink p-6 text-white shadow-lift sm:p-8">
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-racing/20 blur-[60px]" />
                <div className="relative">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Estimated monthly</p>
                  <AnimatedMoney
                    value={numbers.monthly}
                    className="mt-3 block font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
                  />
                  <p className="mt-2 text-[11px] text-white/35">
                    for {tenure} months at {Number(rate).toFixed(2)}% APR
                  </p>

                  <div className="mt-7 space-y-3 border-t border-white/10 pt-5 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-white/45">Car price</span>
                      <span className="font-medium">{fmt(numbers.safePrice)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-white/45">Down payment ({downPct}%)</span>
                      <span className="font-medium">{fmt(numbers.safeDown)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-white/45">Financed amount</span>
                      <span className="font-medium">{fmt(numbers.principal)}</span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-white/10 pt-3">
                      <span className="font-semibold">Total interest</span>
                      <span className="font-display font-bold text-racing-light text-gold">{fmt(numbers.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">Total payable</span>
                      <span className="font-display font-bold">{fmt(numbers.totalPayable)}</span>
                    </div>
                  </div>

                  <Link to="/cars" className="btn-primary mt-7 w-full">
                    Find a car to finance <FiArrowRight />
                  </Link>
                  <p className="mt-3 text-center text-[9px] uppercase tracking-[0.14em] text-white/25">
                    Demo estimate · not a finance offer
                  </p>
                </div>
              </div>

              <div className="rounded-card border border-ink/[0.06] bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold">Payment breakdown</h3>
                    <p className="mt-0.5 text-[10px] text-ink/40">Where your money goes</p>
                  </div>
                  <span className="rounded-full bg-mist px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-ink/40">
                    {downPct}% down
                  </span>
                </div>

                <div className="relative mt-3 h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {chartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatPKR(value)}
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid rgba(11,11,15,0.08)',
                          fontSize: 11,
                          boxShadow: '0 12px 30px -12px rgba(0,0,0,.25)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-ink/35">Financed</span>
                    <span className="mt-1 font-display text-base font-extrabold">{fmt(numbers.principal)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {chartData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-2 text-ink/55">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name}
                      </span>
                      <span className="font-semibold">{fmt(entry.value)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-start gap-2 border-t border-ink/[0.07] pt-4">
                  <FiCheck size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                  <p className="text-[10px] leading-relaxed text-ink/40">
                    Tip: increasing your down payment reduces both the monthly instalment and total interest.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
