import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMail,
  FiPlus,
  FiRefreshCw,
  FiTruck,
  FiUsers,
} from 'react-icons/fi';
import PageMeta from '../components/PageMeta';
import { AnimatedStat } from '../components/ui';
import { formatDate, formatPKR, getCars, getStats } from '../services/api';

const statusColors = {
  'Pre-Booked': '#C9A227',
  Booked: '#3B82F6',
  Delivered: '#10B981',
  Cancelled: '#E10600',
};

const statusClasses = {
  'Pre-Booked': 'bg-gold/15 text-[#8a6d12]',
  Booked: 'bg-blue-50 text-blue-700',
  Delivered: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-racing/10 text-racing',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([getStats(), getCars({})])
      .then(([statsData, carData]) => {
        setStats(statsData);
        setCars(carData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const onReset = () => load();
    window.addEventListener('motora:data-reset', onReset);
    return () => window.removeEventListener('motora:data-reset', onReset);
  }, []);

  const carName = (id) => cars.find((car) => car.id === id)?.name || id;

  const chartData = stats
    ? [
        { name: 'Pre-booked', value: stats.preBookings },
        { name: 'Booked', value: stats.bookedBookings },
        { name: 'Delivered', value: stats.deliveredBookings },
        { name: 'Cancelled', value: stats.cancelledBookings },
      ]
    : [];

  const recent = stats?.bookings?.slice(0, 5) || [];

  return (
    <>
      <PageMeta
        title="Admin Dashboard"
        description="Motora demo admin dashboard — manage cars, bookings and enquiries."
      />

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing">Overview</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Showroom dashboard
          </h1>
          <p className="mt-1.5 text-xs text-ink/45">
            A live snapshot of your demo inventory and customer activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/cars" className="btn-dark btn-sm">
            <FiPlus size={13} /> Add a car
          </Link>
          <button type="button" onClick={load} className="btn-outline btn-sm bg-white" aria-label="Refresh dashboard">
            <FiRefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-40 w-full rounded-card" />
          ))
        ) : (
          <>
            {[
              { label: 'Total cars', value: stats.totalCars, icon: FiTruck, note: `${stats.availableCars} available` },
              { label: 'Total bookings', value: stats.totalBookings, icon: FiCalendar, note: `${stats.bookedBookings} confirmed` },
              { label: 'Pre-bookings', value: stats.preBookings, icon: FiClock, note: 'Awaiting follow-up' },
              { label: 'New enquiries', value: stats.newEnquiries, icon: FiMail, note: `${stats.totalEnquiries} total` },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-card border border-ink/[0.06] bg-white p-5 shadow-soft">
                  <div className="flex items-start justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-mist text-racing">
                      <Icon size={16} />
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                      {item.note}
                    </span>
                  </div>
                  <div className="mt-4">
                    <AnimatedStat value={item.value} label={item.label} />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-card border border-ink/[0.06] bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold">Bookings by status</h2>
              <p className="mt-1 text-[10px] text-ink/40">All demo bookings currently stored in this browser.</p>
            </div>
            <Link to="/admin/bookings" className="text-[10px] font-semibold text-racing">View all</Link>
          </div>
          <div className="mt-5 h-[240px] w-full">
            {loading || !stats ? (
              <div className="skeleton h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(11,11,15,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(11,11,15,0.45)' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'rgba(11,11,15,0.35)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(11,11,15,0.025)' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(11,11,15,0.08)', fontSize: 11 }}
                  />
                  <Bar dataKey="value" radius={[7, 7, 0, 0]} maxBarSize={46}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={statusColors[entry.name] || '#0B0B0F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-card bg-ink p-6 text-white shadow-soft">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-racing/20 blur-[50px]" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Showroom snapshot</span>
              <FiDollarSign size={16} className="text-gold" />
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold leading-tight">
              {stats ? formatPKR(stats.inventoryValue, true) : '—'}
            </p>
            <p className="mt-1 text-[10px] text-white/35">Total demo inventory value</p>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
              <div>
                <p className="font-display text-xl font-extrabold">{stats?.availableCars ?? '—'}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">Available</p>
              </div>
              <div>
                <p className="font-display text-xl font-extrabold">{stats?.soldCars ?? '—'}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">Sold</p>
              </div>
              <div>
                <p className="font-display text-xl font-extrabold">{stats?.deliveredBookings ?? '—'}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">Delivered</p>
              </div>
              <div>
                <p className="font-display text-xl font-extrabold">{stats?.newEnquiries ?? '—'}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">Unread</p>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Link
                to="/admin/enquiries"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] font-medium text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Review new enquiries
                <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-card border border-ink/[0.06] bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/[0.07] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-base font-bold">Recent bookings</h2>
            <p className="mt-0.5 text-[10px] text-ink/40">Latest customer reservations</p>
          </div>
          <Link to="/admin/bookings" className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-racing">
            Manage bookings <FiArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-14 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-xs text-ink/40">No bookings yet. Create one from the public website.</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-ink/[0.06] bg-mist/40 text-[9px] uppercase tracking-[0.14em] text-ink/35">
                    <th className="px-6 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Vehicle</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((booking) => (
                    <tr key={booking.id} className="border-b border-ink/[0.05] last:border-0 hover:bg-mist/30">
                      <td className="px-6 py-4 font-mono text-[10px] font-medium">{booking.reference}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{booking.customer.name}</p>
                        <p className="mt-0.5 text-[10px] text-ink/35">{booking.customer.phone}</p>
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-4 text-ink/60">{carName(booking.carId)}</td>
                      <td className="px-4 py-4 text-ink/45">{formatDate(booking.createdAt)}</td>
                      <td className="px-4 py-4">
                        <span className={`badge ${statusClasses[booking.status] || 'bg-mist text-ink/50'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {booking.type === 'PreBooking'
                          ? formatPKR(booking.tokenAmount)
                          : formatPKR(cars.find((car) => car.id === booking.carId)?.price || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-ink/[0.06] md:hidden">
              {recent.map((booking) => (
                <div key={booking.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] font-semibold">{booking.reference}</p>
                    <span className={`badge ${statusClasses[booking.status] || 'bg-mist text-ink/50'}`}>{booking.status}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold">{booking.customer.name}</p>
                  <p className="mt-0.5 text-[10px] text-ink/40">{carName(booking.carId)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { icon: FiTruck, label: 'Manage inventory', text: 'Add, edit or remove cars', to: '/admin/cars' },
          { icon: FiUsers, label: 'Booking pipeline', text: 'Update customer statuses', to: '/admin/bookings' },
          { icon: FiMail, label: 'Customer enquiries', text: 'Read and respond to messages', to: '/admin/enquiries' },
        ].map(({ icon: Icon, label, text, to }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-3 rounded-card border border-ink/[0.06] bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mist text-racing">
              <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold">{label}</span>
              <span className="mt-0.5 block text-[10px] text-ink/40">{text}</span>
            </span>
            <FiArrowRight size={14} className="text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-racing" />
          </Link>
        ))}
      </div>
    </>
  );
}
