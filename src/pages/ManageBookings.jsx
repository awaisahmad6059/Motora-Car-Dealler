import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import PageMeta from '../components/PageMeta';
import EmptyState from '../components/EmptyState';
import SmartImage from '../components/SmartImage';
import { useToast } from '../components/Toast';
import {
  formatDate,
  formatPKR,
  getBookings,
  getCars,
  updateBookingStatus,
} from '../services/api';

const STATUSES = ['Pre-Booked', 'Booked', 'Cancelled', 'Delivered'];
const statusClasses = {
  'Pre-Booked': 'bg-gold/15 text-[#8a6d12] border-gold/20',
  Booked: 'bg-blue-50 text-blue-700 border-blue-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-racing/10 text-racing border-racing/20',
};

export default function ManageBookings() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([getBookings(), getCars({})])
      .then(([bookingData, carData]) => {
        setBookings(bookingData);
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

  const getCar = (id) => cars.find((car) => car.id === id);

  const counts = useMemo(
    () =>
      bookings.reduce(
        (acc, booking) => {
          acc.All += 1;
          acc[booking.status] = (acc[booking.status] || 0) + 1;
          return acc;
        },
        { All: 0, 'Pre-Booked': 0, Booked: 0, Cancelled: 0, Delivered: 0 },
      ),
    [bookings],
  );

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      if (statusFilter !== 'All' && booking.status !== statusFilter) return false;
      if (search.trim()) {
        const haystack = `${booking.reference} ${booking.customer.name} ${booking.customer.phone} ${booking.customer.email}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, search]);

  const changeStatus = async (booking, nextStatus) => {
    if (nextStatus === booking.status) return;
    setBusyId(booking.id);
    try {
      const updated = await updateBookingStatus(booking.id, nextStatus);
      setBookings((current) => current.map((item) => (item.id === booking.id ? updated : item)));
      showToast(`${booking.reference} updated to ${nextStatus}.`);
    } catch {
      showToast('Could not update the booking status.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const bookingAmount = (booking) => {
    if (booking.type === 'FullBooking') {
      return getCar(booking.carId)?.price || 0;
    }
    return booking.tokenAmount;
  };

  return (
    <>
      <PageMeta title="Manage Bookings" description="View and update demo bookings at Motora Car Dealers." />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing">Pipeline</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Manage bookings</h1>
          <p className="mt-1.5 text-xs text-ink/45">
            {counts.All} bookings · {counts['Pre-Booked']} pre-booked · {counts.Booked} confirmed
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/track" target="_blank" className="btn-outline btn-sm bg-white">
            <FiSearch size={13} /> Test tracker
          </Link>
          <Link to="/cars" className="btn-dark btn-sm">
            <FiTruck size={13} /> Public showroom
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pre-booked', value: counts['Pre-Booked'], icon: FiClock, color: 'text-gold', bg: 'bg-gold/10' },
          { label: 'Booked', value: counts.Booked, icon: FiCalendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Delivered', value: counts.Delivered, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Cancelled', value: counts.Cancelled, icon: FiCreditCard, color: 'text-racing', bg: 'bg-racing/5' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-card border border-ink/[0.06] bg-white p-4 shadow-soft">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${item.bg} ${item.color}`}>
                <Icon size={16} />
              </span>
              <div>
                <p className="font-display text-xl font-extrabold">{item.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-ink/35">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-card border border-ink/[0.06] bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-ink/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {['All', ...STATUSES].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3.5 py-2 text-[10px] font-semibold transition ${
                  statusFilter === status
                    ? 'bg-ink text-white'
                    : 'bg-mist/60 text-ink/50 hover:bg-mist hover:text-ink'
                }`}
              >
                {status} <span className={`ml-1 ${statusFilter === status ? 'text-white/50' : 'text-ink/30'}`}>{counts[status] || 0}</span>
              </button>
            ))}
          </div>
          <label className="relative w-full lg:max-w-[240px]">
            <span className="sr-only">Search bookings</span>
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" size={13} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reference or customer…"
              className="w-full rounded-xl border border-ink/10 bg-mist/50 py-2.5 pl-9 pr-3 text-xs focus:border-racing focus:bg-white focus:outline-none"
            />
          </label>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FiCalendar}
              title="No bookings in this view"
              description="Try clearing the status filter or search. New demo bookings appear here instantly."
              action={
                <button
                  type="button"
                  onClick={() => { setStatusFilter('All'); setSearch(''); }}
                  className="btn-outline btn-sm"
                >
                  Clear filters
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[1040px] text-left text-xs">
                <thead>
                  <tr className="border-b border-ink/[0.06] bg-mist/40 text-[9px] uppercase tracking-[0.13em] text-ink/35">
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-3 py-3 font-semibold">Customer</th>
                    <th className="px-3 py-3 font-semibold">Vehicle</th>
                    <th className="px-3 py-3 font-semibold">Type</th>
                    <th className="px-3 py-3 font-semibold">Amount</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => {
                    const car = getCar(booking.carId);
                    return (
                      <tr key={booking.id} className="border-b border-ink/[0.05] last:border-0 hover:bg-mist/25">
                        <td className="px-5 py-4">
                          <p className="font-mono text-[10px] font-semibold">{booking.reference}</p>
                          <p className="mt-1 text-[9px] text-ink/35">{formatDate(booking.createdAt)}</p>
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-semibold">{booking.customer.name}</p>
                          <p className="mt-0.5 text-[9px] text-ink/35">{booking.customer.phone}</p>
                          <p className="mt-0.5 max-w-[180px] truncate text-[9px] text-ink/30">{booking.customer.email}</p>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            {car && <SmartImage src={car.images?.[0]} alt={car.name} className="h-9 w-12 shrink-0 rounded-md" />}
                            <div className="min-w-0">
                              <p className="max-w-[170px] truncate font-medium">{car?.name || booking.carId}</p>
                              <p className="mt-0.5 text-[9px] text-ink/30">{booking.preferences?.delivery || 'Pickup'} · {formatDate(booking.preferences?.visitDate)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span className={`badge ${booking.type === 'PreBooking' ? 'bg-gold/10 text-[#8a6d12]' : 'bg-mist text-ink/60'}`}>
                            {booking.type === 'PreBooking' ? 'Pre-booking' : 'Full'}
                          </span>
                          <p className="mt-1 text-[8px] uppercase tracking-wider text-ink/30">{booking.paymentMethod}</p>
                        </td>
                        <td className="px-3 py-4 font-semibold">{formatPKR(bookingAmount(booking))}</td>
                        <td className="px-3 py-4">
                          <span className={`badge border ${statusClasses[booking.status] || 'border-ink/10 bg-mist text-ink/50'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={booking.status}
                            onChange={(event) => changeStatus(booking, event.target.value)}
                            disabled={busyId === booking.id}
                            className="rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-[10px] font-medium focus:border-racing focus:outline-none"
                            aria-label={`Update status for ${booking.reference}`}
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-ink/[0.06] xl:hidden">
              {filtered.map((booking) => {
                const car = getCar(booking.carId);
                return (
                  <div key={booking.id} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-[10px] font-semibold">{booking.reference}</p>
                      <span className={`badge border ${statusClasses[booking.status] || 'border-ink/10 bg-mist text-ink/50'}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-3">
                      {car && <SmartImage src={car.images?.[0]} alt={car.name} className="h-16 w-24 shrink-0 rounded-lg" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">{car?.name || 'Vehicle removed'}</p>
                        <p className="mt-1 text-[10px] text-ink/45">{booking.customer.name} · {booking.customer.phone}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-ink/35">
                          <span>{booking.type === 'PreBooking' ? 'Pre-booking' : 'Full booking'}</span>
                          <span className="h-0.5 w-0.5 rounded-full bg-ink/25" />
                          <span>{formatPKR(bookingAmount(booking))}</span>
                          <span className="h-0.5 w-0.5 rounded-full bg-ink/25" />
                          <span>{formatDate(booking.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <label htmlFor={`status-${booking.id}`} className="text-[9px] font-semibold uppercase tracking-wider text-ink/35">Status</label>
                      <select
                        id={`status-${booking.id}`}
                        value={booking.status}
                        onChange={(event) => changeStatus(booking, event.target.value)}
                        disabled={busyId === booking.id}
                        className="flex-1 rounded-lg border border-ink/10 bg-white px-3 py-2 text-[10px] font-medium focus:border-racing focus:outline-none"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 rounded-card border border-ink/[0.06] bg-white p-4 text-[10px] text-ink/40 shadow-soft">
        <span className="flex items-center gap-1.5"><FiUser size={11} /> Customer details come from the public booking form</span>
        <span className="flex items-center gap-1.5"><FiMail size={11} /> Demo emails are never sent</span>
        <span className="flex items-center gap-1.5"><FiPhone size={11} /> Status changes are saved locally</span>
        <span className="flex items-center gap-1.5"><FiMapPin size={11} /> Data lives in this browser</span>
      </div>
    </>
  );
}
