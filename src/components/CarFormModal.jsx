import { useEffect, useState } from 'react';
import { FiImage, FiInfo, FiLoader, FiSave } from 'react-icons/fi';
import Modal from './Modal';
import { useToast } from './Toast';
import { addCar, updateCar } from '../services/api';

const emptyForm = {
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price: '',
  mileage: 0,
  engine: '',
  fuel: 'Petrol',
  transmission: 'Automatic',
  bodyType: 'Sedan',
  color: '',
  condition: 'Used',
  city: 'Lahore',
  images: '',
  features: '',
  description: '',
  isFeatured: false,
  isNewArrival: false,
  status: 'Available',
};

export default function CarFormModal({ open, onClose, car, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (car) {
      setForm({
        name: car.name || '',
        brand: car.brand || '',
        model: car.model || '',
        year: car.year || new Date().getFullYear(),
        price: car.price ?? '',
        mileage: car.mileage ?? 0,
        engine: car.engine || '',
        fuel: car.fuel || 'Petrol',
        transmission: car.transmission || 'Automatic',
        bodyType: car.bodyType || 'Sedan',
        color: car.color || '',
        condition: car.condition || 'Used',
        city: car.city || 'Lahore',
        images: (car.images || []).join('\n'),
        features: (car.features || []).join('\n'),
        description: car.description || '',
        isFeatured: Boolean(car.isFeatured),
        isNewArrival: Boolean(car.isNewArrival),
        status: car.status || 'Available',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, car]);

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
    const next = {};
    if (!form.name.trim()) next.name = 'Car name is required.';
    if (!form.brand.trim()) next.brand = 'Brand is required.';
    if (!form.model.trim()) next.model = 'Model is required.';
    if (!form.price || Number(form.price) <= 0) next.price = 'Enter a valid price.';
    if (!form.year || Number(form.year) < 1990) next.year = 'Enter a valid year.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage) || 0,
      images: form.images
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      features: form.features
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    };
    try {
      const saved = car ? await updateCar(car.id, payload) : await addCar(payload);
      showToast(car ? 'Car updated successfully.' : 'New car added to the showroom.');
      onSaved(saved, Boolean(car));
      onClose();
    } catch {
      showToast('Could not save the car. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const firstImage = form.images.split('\n').map((line) => line.trim()).filter(Boolean)[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={car ? 'Edit car' : 'Add a new car'}
      subtitle={car ? 'Update the vehicle details shown on the public site.' : 'Create a new listing for the demo showroom.'}
      size="lg"
      footer={
        <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <button type="button" onClick={onClose} className="btn-outline btn-sm">Cancel</button>
          <button type="submit" form="car-form" disabled={saving} className="btn-primary btn-sm min-w-[140px]">
            {saving ? (
              <><FiLoader className="animate-spin" size={13} /> Saving…</>
            ) : (
              <><FiSave size={13} /> {car ? 'Save changes' : 'Add car'}</>
            )}
          </button>
        </div>
      }
    >
      <form id="car-form" onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="demo-note">
          <FiInfo size={14} className="mt-0.5 shrink-0 text-gold" />
          <p>This car will be stored in localStorage and appear on the public website immediately.</p>
        </div>

        <div>
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">Basic details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="car-name" className="input-label">Car name *</label>
              <input
                id="car-name"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="e.g. Toyota Corolla Altis Grande"
                className={`input-field ${errors.name ? 'border-racing' : ''}`}
              />
              {errors.name && <p className="mt-1.5 text-[11px] text-racing">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="car-brand" className="input-label">Brand *</label>
              <input
                id="car-brand"
                value={form.brand}
                onChange={(event) => update('brand', event.target.value)}
                placeholder="Toyota"
                className={`input-field ${errors.brand ? 'border-racing' : ''}`}
              />
              {errors.brand && <p className="mt-1.5 text-[11px] text-racing">{errors.brand}</p>}
            </div>
            <div>
              <label htmlFor="car-model" className="input-label">Model *</label>
              <input
                id="car-model"
                value={form.model}
                onChange={(event) => update('model', event.target.value)}
                placeholder="Altis Grande 1.8"
                className={`input-field ${errors.model ? 'border-racing' : ''}`}
              />
              {errors.model && <p className="mt-1.5 text-[11px] text-racing">{errors.model}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="car-year" className="input-label">Year *</label>
                <input
                  id="car-year"
                  type="number"
                  min="1990"
                  max="2035"
                  value={form.year}
                  onChange={(event) => update('year', event.target.value)}
                  className={`input-field ${errors.year ? 'border-racing' : ''}`}
                />
                {errors.year && <p className="mt-1.5 text-[11px] text-racing">{errors.year}</p>}
              </div>
              <div>
                <label htmlFor="car-price" className="input-label">Price (PKR) *</label>
                <input
                  id="car-price"
                  type="number"
                  min="0"
                  step="50000"
                  value={form.price}
                  onChange={(event) => update('price', event.target.value)}
                  placeholder="8950000"
                  className={`input-field ${errors.price ? 'border-racing' : ''}`}
                />
                {errors.price && <p className="mt-1.5 text-[11px] text-racing">{errors.price}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="car-mileage" className="input-label">Mileage (km)</label>
                <input
                  id="car-mileage"
                  type="number"
                  min="0"
                  value={form.mileage}
                  onChange={(event) => update('mileage', event.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="car-city" className="input-label">City</label>
                <input
                  id="car-city"
                  value={form.city}
                  onChange={(event) => update('city', event.target.value)}
                  placeholder="Lahore"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">Specifications</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="car-engine" className="input-label">Engine</label>
              <input
                id="car-engine"
                value={form.engine}
                onChange={(event) => update('engine', event.target.value)}
                placeholder="1.8L Petrol"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="car-color" className="input-label">Colour</label>
              <input
                id="car-color"
                value={form.color}
                onChange={(event) => update('color', event.target.value)}
                placeholder="Pearl White"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="car-body" className="input-label">Body type</label>
              <select id="car-body" value={form.bodyType} onChange={(event) => update('bodyType', event.target.value)} className="select-field">
                {['Sedan', 'SUV', 'Hatchback', 'Coupe'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="car-fuel" className="input-label">Fuel type</label>
              <select id="car-fuel" value={form.fuel} onChange={(event) => update('fuel', event.target.value)} className="select-field">
                {['Petrol', 'Hybrid', 'Electric'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="car-transmission" className="input-label">Transmission</label>
              <select id="car-transmission" value={form.transmission} onChange={(event) => update('transmission', event.target.value)} className="select-field">
                {['Automatic', 'Manual'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="car-condition" className="input-label">Condition</label>
              <select id="car-condition" value={form.condition} onChange={(event) => update('condition', event.target.value)} className="select-field">
                {['New', 'Used'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">Listing &amp; media</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="car-images" className="input-label">Image URLs — one per line</label>
              <textarea
                id="car-images"
                rows="3"
                value={form.images}
                onChange={(event) => update('images', event.target.value)}
                placeholder="https://images.unsplash.com/photo-…"
                className="input-field resize-none font-mono text-[11px]"
              />
              <p className="mt-1.5 text-[10px] text-ink/35">
                Use royalty-free image URLs. The first image becomes the card and main gallery photo.
              </p>
            </div>
            {firstImage && (
              <div className="flex items-center gap-3 rounded-xl border border-ink/[0.08] bg-mist/50 p-3">
                <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                  <img
                    src={firstImage}
                    alt="Car preview"
                    className="h-full w-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                  <FiImage className="absolute inset-0 m-auto text-ink/20" size={16} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-ink/60">Cover image preview</p>
                  <p className="mt-0.5 truncate text-[9px] text-ink/30">{firstImage}</p>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="car-features" className="input-label">Features — one per line</label>
              <textarea
                id="car-features"
                rows="3"
                value={form.features}
                onChange={(event) => update('features', event.target.value)}
                placeholder={'Sunroof\n360° camera\nApple CarPlay'}
                className="input-field resize-none text-xs"
              />
            </div>
            <div>
              <label htmlFor="car-description" className="input-label">Description</label>
              <textarea
                id="car-description"
                rows="3"
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="Write a short, compelling description of this vehicle…"
                className="input-field resize-none"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 px-4 py-3">
                <input type="checkbox" checked={form.isFeatured} onChange={(event) => update('isFeatured', event.target.checked)} className="h-4 w-4 accent-[#E10600]" />
                <span className="text-xs font-medium">Featured on homepage</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 px-4 py-3">
                <input type="checkbox" checked={form.isNewArrival} onChange={(event) => update('isNewArrival', event.target.checked)} className="h-4 w-4 accent-[#E10600]" />
                <span className="text-xs font-medium">Mark as new arrival</span>
              </label>
            </div>
            <div>
              <label htmlFor="car-status" className="input-label">Availability</label>
              <select id="car-status" value={form.status} onChange={(event) => update('status', event.target.value)} className="select-field">
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
