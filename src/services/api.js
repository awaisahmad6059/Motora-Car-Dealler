import initialCars from '../data/cars.json';
import initialBookings from '../data/bookings.json';
import initialEnquiries from '../data/enquiries.json';
import initialTestimonials from '../data/testimonials.json';

/**
 * Motora demo data layer.
 *
 * Every page talks to this file only. Data is seeded from the local JSON files
 * and persisted to localStorage. Swapping these functions for real HTTP calls
 * later is all that is needed to connect a backend.
 */

const KEYS = {
  cars: 'motora_cars',
  bookings: 'motora_bookings',
  enquiries: 'motora_enquiries',
  testimonials: 'motora_testimonials',
  admin: 'motora_admin',
  counterPrefix: 'motora_booking_counter_',
};

export const DEMO_ADMIN = {
  email: 'admin@motora.demo',
  password: 'admin123',
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const delay = () => new Promise((resolve) => setTimeout(resolve, 320 + Math.random() * 240));

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return clone(fallback);
    return JSON.parse(raw);
  } catch {
    return clone(fallback);
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo remains usable even when storage is unavailable (e.g. private mode).
  }
}

function seedIfNeeded() {
  try {
    if (!localStorage.getItem(KEYS.cars)) safeWrite(KEYS.cars, initialCars);
    if (!localStorage.getItem(KEYS.bookings)) safeWrite(KEYS.bookings, initialBookings);
    if (!localStorage.getItem(KEYS.enquiries)) safeWrite(KEYS.enquiries, initialEnquiries);
    if (!localStorage.getItem(KEYS.testimonials)) safeWrite(KEYS.testimonials, initialTestimonials);
  } catch {
    // Ignore storage availability errors.
  }
}

function getCarsStore() {
  seedIfNeeded();
  return safeRead(KEYS.cars, initialCars);
}

function getBookingsStore() {
  seedIfNeeded();
  return safeRead(KEYS.bookings, initialBookings);
}

function getEnquiriesStore() {
  seedIfNeeded();
  return safeRead(KEYS.enquiries, initialEnquiries);
}

const normalize = (value) => String(value ?? '').trim().toLowerCase();

function matchesSearch(car, search) {
  if (!search) return true;
  const haystack = [car.name, car.brand, car.model, car.bodyType, car.fuel, car.city]
    .join(' ')
    .toLowerCase();
  return haystack.includes(normalize(search));
}

function sortCars(cars, sort) {
  const list = [...cars];
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'mileage-asc':
      return list.sort((a, b) => a.mileage - b.mileage);
    case 'newest':
    default:
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export function formatPKR(value, compact = false) {
  if (Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  }).format(Number(value));
}

export function formatMileage(value) {
  if (Number(value) === 0) return '0 km · Brand new';
  return `${new Intl.NumberFormat('en-PK').format(Number(value))} km`;
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export async function getCars(filters = {}) {
  await delay();
  const {
    search = '',
    brand = '',
    bodyType = '',
    fuel = '',
    transmission = '',
    condition = '',
    minPrice = '',
    maxPrice = '',
    year = '',
    sort = 'newest',
  } = filters;

  let cars = getCarsStore();

  cars = cars.filter((car) => {
    if (!matchesSearch(car, search)) return false;
    if (brand && normalize(car.brand) !== normalize(brand)) return false;
    if (bodyType && normalize(car.bodyType) !== normalize(bodyType)) return false;
    if (fuel && normalize(car.fuel) !== normalize(fuel)) return false;
    if (transmission && normalize(car.transmission) !== normalize(transmission)) return false;
    if (condition && normalize(car.condition) !== normalize(condition)) return false;
    if (minPrice !== '' && Number(car.price) < Number(minPrice)) return false;
    if (maxPrice !== '' && Number(car.price) > Number(maxPrice)) return false;
    if (year && String(car.year) !== String(year)) return false;
    return true;
  });

  return clone(sortCars(cars, sort));
}

export async function getCarById(id) {
  await delay();
  const car = getCarsStore().find((item) => item.id === id);
  return car ? clone(car) : null;
}

export async function getFeaturedCars(limit = 6) {
  await delay();
  return clone(
    getCarsStore()
      .filter((car) => car.isFeatured && car.status === 'Available')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit),
  );
}

export async function getNewArrivals(limit = 8) {
  await delay();
  return clone(
    getCarsStore()
      .filter((car) => car.isNewArrival || car.condition === 'New')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit),
  );
}

export async function getSimilarCars(car, limit = 4) {
  await delay();
  if (!car) return [];
  return clone(
    getCarsStore()
      .filter((item) => item.id !== car.id && item.status !== 'Sold')
      .sort((a, b) => {
        const scoreA = (a.bodyType === car.bodyType ? 2 : 0) + (a.brand === car.brand ? 1 : 0);
        const scoreB = (b.bodyType === car.bodyType ? 2 : 0) + (b.brand === car.brand ? 1 : 0);
        return scoreB - scoreA;
      })
      .slice(0, limit),
  );
}

export async function getFilterOptions() {
  const cars = getCarsStore();
  const unique = (key) => [...new Set(cars.map((car) => car[key]))].sort();
  return {
    brands: unique('brand'),
    bodyTypes: unique('bodyType'),
    fuels: unique('fuel'),
    transmissions: unique('transmission'),
    conditions: unique('condition'),
    years: [...new Set(cars.map((car) => car.year))].sort((a, b) => b - a),
    minPrice: Math.min(...cars.map((car) => car.price)),
    maxPrice: Math.max(...cars.map((car) => car.price)),
  };
}

function buildReference() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const key = `${KEYS.counterPrefix}${datePart}`;
  let counter = 1;
  try {
    counter = Number(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, String(counter));
  } catch {
    counter = Math.floor(Math.random() * 9000) + 100;
  }
  return `MTR-${datePart}-${String(counter).padStart(4, '0')}`;
}

export async function createBooking(payload) {
  await delay();
  const bookings = getBookingsStore();
  let reference = buildReference();

  // Guard against any counter collision and keep references unique.
  while (bookings.some((booking) => booking.reference === reference)) {
    reference = buildReference();
  }

  const booking = {
    id: `bk-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    reference,
    carId: payload.carId,
    customer: {
      name: payload.customer?.name?.trim() || '',
      phone: payload.customer?.phone?.trim() || '',
      email: payload.customer?.email?.trim() || '',
      cnic: payload.customer?.cnic?.trim() || '',
      city: payload.customer?.city?.trim() || '',
      address: payload.customer?.address?.trim() || '',
    },
    type: payload.type === 'FullBooking' ? 'FullBooking' : 'PreBooking',
    tokenAmount: Number(payload.tokenAmount) || 0,
    paymentMethod: payload.paymentMethod || 'Pay at Showroom',
    preferences: {
      color: payload.preferences?.color || '',
      delivery: payload.preferences?.delivery || 'Pickup',
      visitDate: payload.preferences?.visitDate || '',
    },
    status: payload.type === 'FullBooking' ? 'Booked' : 'Pre-Booked',
    createdAt: new Date().toISOString(),
  };

  safeWrite(KEYS.bookings, [booking, ...bookings]);
  return clone(booking);
}

export async function getBookingByReference(reference) {
  await delay();
  const query = normalize(reference);
  if (!query) return null;
  const booking = getBookingsStore().find(
    (item) => normalize(item.reference) === query || normalize(item.id) === query,
  );
  return booking ? clone(booking) : null;
}

export async function createEnquiry(payload) {
  await delay();
  const enquiries = getEnquiriesStore();
  const enquiry = {
    id: `enq-${Date.now()}`,
    name: payload.name?.trim() || '',
    email: payload.email?.trim() || '',
    phone: payload.phone?.trim() || '',
    message: payload.message?.trim() || '',
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  safeWrite(KEYS.enquiries, [enquiry, ...enquiries]);
  return clone(enquiry);
}

export async function getTestimonials() {
  await delay();
  return clone(safeRead(KEYS.testimonials, initialTestimonials));
}

export async function adminLogin(email, password) {
  await delay();
  const valid =
    normalize(email) === normalize(DEMO_ADMIN.email) && password === DEMO_ADMIN.password;
  if (valid) {
    try {
      localStorage.setItem(KEYS.admin, 'true');
    } catch {
      // ignore
    }
    return { success: true };
  }
  return { success: false, message: 'Incorrect email or password. Use the demo credentials shown below.' };
}

export function isAdminAuthenticated() {
  try {
    return localStorage.getItem(KEYS.admin) === 'true';
  } catch {
    return false;
  }
}

export function logoutAdmin() {
  try {
    localStorage.removeItem(KEYS.admin);
  } catch {
    // ignore
  }
}

export async function getStats() {
  await delay();
  const cars = getCarsStore();
  const bookings = getBookingsStore();
  const enquiries = getEnquiriesStore();

  const statusCount = (status) => bookings.filter((booking) => booking.status === status).length;
  return {
    totalCars: cars.length,
    availableCars: cars.filter((car) => car.status === 'Available').length,
    soldCars: cars.filter((car) => car.status === 'Sold').length,
    totalBookings: bookings.length,
    preBookings: statusCount('Pre-Booked'),
    bookedBookings: statusCount('Booked'),
    deliveredBookings: statusCount('Delivered'),
    cancelledBookings: statusCount('Cancelled'),
    totalEnquiries: enquiries.length,
    newEnquiries: enquiries.filter((enquiry) => !enquiry.isRead).length,
    inventoryValue: cars.reduce((sum, car) => sum + Number(car.price || 0), 0),
    bookings,
  };
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function addCar(payload) {
  await delay();
  const cars = getCarsStore();
  let id = slugify(`${payload.name}-${payload.year}`) || `car-${Date.now()}`;
  if (cars.some((car) => car.id === id)) id = `${id}-${Date.now().toString().slice(-4)}`;

  const car = {
    id,
    name: payload.name?.trim() || 'Untitled Car',
    brand: payload.brand?.trim() || '',
    model: payload.model?.trim() || '',
    year: Number(payload.year) || new Date().getFullYear(),
    price: Number(payload.price) || 0,
    mileage: Number(payload.mileage) || 0,
    engine: payload.engine?.trim() || '',
    fuel: payload.fuel || 'Petrol',
    transmission: payload.transmission || 'Automatic',
    bodyType: payload.bodyType || 'Sedan',
    color: payload.color?.trim() || '',
    condition: payload.condition || 'Used',
    city: payload.city?.trim() || '',
    images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : [],
    features: Array.isArray(payload.features) ? payload.features.filter(Boolean) : [],
    description: payload.description?.trim() || '',
    isFeatured: Boolean(payload.isFeatured),
    isNewArrival: Boolean(payload.isNewArrival),
    status: payload.status || 'Available',
    createdAt: new Date().toISOString(),
  };

  safeWrite(KEYS.cars, [car, ...cars]);
  return clone(car);
}

export async function updateCar(id, payload) {
  await delay();
  const cars = getCarsStore();
  const index = cars.findIndex((car) => car.id === id);
  if (index === -1) throw new Error('Car not found');
  const existing = cars[index];
  const updated = {
    ...existing,
    ...payload,
    year: Number(payload.year ?? existing.year),
    price: Number(payload.price ?? existing.price),
    mileage: Number(payload.mileage ?? existing.mileage),
    isFeatured: Boolean(payload.isFeatured ?? existing.isFeatured),
    isNewArrival: Boolean(payload.isNewArrival ?? existing.isNewArrival),
    images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : existing.images,
    features: Array.isArray(payload.features) ? payload.features.filter(Boolean) : existing.features,
  };
  cars[index] = updated;
  safeWrite(KEYS.cars, cars);
  return clone(updated);
}

export async function deleteCar(id) {
  await delay();
  const cars = getCarsStore();
  safeWrite(
    KEYS.cars,
    cars.filter((car) => car.id !== id),
  );
  return { success: true };
}

export async function getBookings() {
  await delay();
  return clone(getBookingsStore()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function updateBookingStatus(id, status) {
  await delay();
  const bookings = getBookingsStore();
  const index = bookings.findIndex((booking) => booking.id === id || booking.reference === id);
  if (index === -1) throw new Error('Booking not found');
  bookings[index] = { ...bookings[index], status };
  safeWrite(KEYS.bookings, bookings);
  return clone(bookings[index]);
}

export async function getEnquiries() {
  await delay();
  return clone(getEnquiriesStore()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function markEnquiryRead(id) {
  await delay();
  const enquiries = getEnquiriesStore();
  const index = enquiries.findIndex((enquiry) => enquiry.id === id);
  if (index === -1) throw new Error('Enquiry not found');
  enquiries[index] = { ...enquiries[index], isRead: true };
  safeWrite(KEYS.enquiries, enquiries);
  return clone(enquiries[index]);
}

export async function resetDemoData() {
  await delay();
  safeWrite(KEYS.cars, initialCars);
  safeWrite(KEYS.bookings, initialBookings);
  safeWrite(KEYS.enquiries, initialEnquiries);
  safeWrite(KEYS.testimonials, initialTestimonials);
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(KEYS.counterPrefix))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
  return { success: true };
}

export async function getCarsSnapshot() {
  return clone(getCarsStore());
}
