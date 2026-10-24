import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit2,
  FiExternalLink,
  FiImage,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
  FiTruck,
  FiX,
} from 'react-icons/fi';
import PageMeta from '../components/PageMeta';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import CarFormModal from '../components/CarFormModal';
import SmartImage from '../components/SmartImage';
import { useToast } from '../components/Toast';
import { deleteCar, formatPKR, getCars, updateCar } from '../services/api';

export default function ManageCars() {
  const { showToast } = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(null);

  const load = () => {
    setLoading(true);
    getCars({})
      .then(setCars)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const onReset = () => load();
    window.addEventListener('motora:data-reset', onReset);
    return () => window.removeEventListener('motora:data-reset', onReset);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return cars;
    const query = search.toLowerCase();
    return cars.filter((car) =>
      `${car.name} ${car.brand} ${car.model} ${car.city} ${car.condition}`.toLowerCase().includes(query),
    );
  }, [cars, search]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (car) => {
    setEditing(car);
    setFormOpen(true);
  };

  const handleSaved = (saved, isEdit) => {
    setCars((current) => {
      if (isEdit) return current.map((car) => (car.id === saved.id ? saved : car));
      return [saved, ...current];
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCar(deleteTarget.id);
      setCars((current) => current.filter((car) => car.id !== deleteTarget.id));
      showToast('Car removed from the showroom.');
      setDeleteTarget(null);
    } catch {
      showToast('Could not delete the car. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (car) => {
    setStatusBusy(car.id);
    const nextStatus = car.status === 'Available' ? 'Sold' : 'Available';
    try {
      const updated = await updateCar(car.id, { status: nextStatus });
      setCars((current) => current.map((item) => (item.id === car.id ? updated : item)));
      showToast(`${car.name} marked as ${nextStatus.toLowerCase()}.`);
    } catch {
      showToast('Could not update availability.', 'error');
    } finally {
      setStatusBusy(null);
    }
  };

  return (
    <>
      <PageMeta title="Manage Cars" description="Add, edit and remove cars in the Motora demo showroom." />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-racing">Inventory</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Manage cars</h1>
          <p className="mt-1.5 text-xs text-ink/45">
            {cars.length} vehicles · {cars.filter((car) => car.status === 'Available').length} available ·{' '}
            {cars.filter((car) => car.isFeatured).length} featured
          </p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary btn-sm w-fit">
          <FiPlus size={14} /> Add new car
        </button>
      </div>

      <div className="rounded-card border border-ink/[0.06] bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-ink/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full sm:max-w-xs">
            <span className="sr-only">Search cars</span>
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" size={14} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search car, brand or city…"
              className="w-full rounded-xl border border-ink/10 bg-mist/50 py-2.5 pl-9 pr-3 text-xs focus:border-racing focus:bg-white focus:outline-none"
            />
          </label>
          <p className="text-[10px] text-ink/35">{filtered.length} result{filtered.length === 1 ? '' : 's'}</p>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={search ? FiSearch : FiTruck}
              title={search ? 'No cars match your search' : 'No cars in the showroom'}
              description={search ? 'Try a different brand, name or city.' : 'Add your first demo car to get started.'}
              action={
                search ? (
                  <button type="button" onClick={() => setSearch('')} className="btn-outline btn-sm">
                    Clear search
                  </button>
                ) : (
                  <button type="button" onClick={openAdd} className="btn-primary btn-sm">
                    <FiPlus size={13} /> Add car
                  </button>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead>
                  <tr className="border-b border-ink/[0.06] bg-mist/40 text-[9px] uppercase tracking-[0.13em] text-ink/35">
                    <th className="px-5 py-3 font-semibold">Vehicle</th>
                    <th className="px-3 py-3 font-semibold">Year</th>
                    <th className="px-3 py-3 font-semibold">Price</th>
                    <th className="px-3 py-3 font-semibold">Type</th>
                    <th className="px-3 py-3 font-semibold">Availability</th>
                    <th className="px-3 py-3 font-semibold">Flags</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((car) => (
                    <tr key={car.id} className="border-b border-ink/[0.05] last:border-0 hover:bg-mist/25">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <SmartImage src={car.images?.[0]} alt={car.name} className="h-11 w-16 shrink-0 rounded-lg" />
                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate font-semibold text-ink/85">{car.name}</p>
                            <p className="mt-0.5 text-[10px] text-ink/35">{car.brand} · {car.bodyType} · {car.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink/55">{car.year}</td>
                      <td className="px-3 py-3 font-semibold">{formatPKR(car.price)}</td>
                      <td className="px-3 py-3">
                        <span className={`badge ${car.condition === 'New' ? 'bg-ink text-white' : 'bg-mist text-ink/60'}`}>
                          {car.condition}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => toggleStatus(car)}
                          disabled={statusBusy === car.id}
                          className={`badge transition ${
                            car.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-racing/10 text-racing hover:bg-racing/15'
                          }`}
                          title="Toggle availability"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${car.status === 'Available' ? 'bg-emerald-500' : 'bg-racing'}`} />
                          {car.status === 'Available' ? 'Available' : 'Sold'}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          {car.isFeatured && <FiStar size={13} className="text-gold" fill="currentColor" aria-label="Featured" />}
                          {car.isNewArrival && <span className="rounded bg-mist px-1.5 py-0.5 text-[8px] font-bold uppercase text-ink/45">New</span>}
                          {!car.isFeatured && !car.isNewArrival && <span className="text-[10px] text-ink/20">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/cars/${car.id}`}
                            target="_blank"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 text-ink/40 transition hover:border-ink/30 hover:text-ink"
                            aria-label={`View ${car.name} on the public site`}
                          >
                            <FiExternalLink size={13} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEdit(car)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 text-ink/40 transition hover:border-ink hover:text-ink"
                            aria-label={`Edit ${car.name}`}
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(car)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 text-ink/40 transition hover:border-racing hover:bg-racing/5 hover:text-racing"
                            aria-label={`Delete ${car.name}`}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-ink/[0.06] lg:hidden">
              {filtered.map((car) => (
                <div key={car.id} className="p-4">
                  <div className="flex gap-3">
                    <SmartImage src={car.images?.[0]} alt={car.name} className="h-20 w-28 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">{car.name}</p>
                          <p className="mt-0.5 text-[10px] text-ink/40">{car.brand} · {car.year} · {car.condition}</p>
                        </div>
                        {car.isFeatured && <FiStar size={13} className="shrink-0 text-gold" fill="currentColor" />}
                      </div>
                      <p className="mt-2 font-display text-sm font-extrabold">{formatPKR(car.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`badge ${car.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-racing/10 text-racing'}`}>
                          {car.status}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-ink/30">{car.bodyType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => openEdit(car)} className="btn-outline btn-sm flex-1 py-2">
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button type="button" onClick={() => toggleStatus(car)} disabled={statusBusy === car.id} className="btn-outline btn-sm flex-1 py-2">
                      <FiCheckCircle size={12} /> {car.status === 'Available' ? 'Mark sold' : 'Available'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(car)}
                      className="grid h-8 w-9 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/40 transition hover:border-racing hover:text-racing"
                      aria-label={`Delete ${car.name}`}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CarFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        car={editing}
        onSaved={handleSaved}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this car?"
        subtitle="This will remove the listing from the demo showroom."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="btn-outline btn-sm">Cancel</button>
            <button type="button" onClick={handleDelete} disabled={deleting} className="btn-primary btn-sm">
              {deleting ? 'Deleting…' : 'Delete car'}
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3 rounded-xl border border-racing/15 bg-racing/[0.03] px-4 py-3.5">
          <FiAlertTriangle size={18} className="mt-0.5 shrink-0 text-racing" />
          <div className="text-xs leading-relaxed text-ink/60">
            <p className="font-semibold text-ink">{deleteTarget?.name}</p>
            <p className="mt-1">
              The car will be removed from the showroom. Existing demo bookings that
              reference it will remain in your booking history.
            </p>
          </div>
        </div>
        {deleteTarget?.images?.[0] && (
          <div className="mt-4 overflow-hidden rounded-xl">
            <SmartImage src={deleteTarget.images[0]} alt={deleteTarget.name} className="h-36 w-full" />
          </div>
        )}
      </Modal>
    </>
  );
}
