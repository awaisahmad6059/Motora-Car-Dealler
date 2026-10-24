import { Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import PreBook from './pages/PreBook';
import Book from './pages/Book';
import Finance from './pages/Finance';
import Contact from './pages/Contact';
import Track from './pages/Track';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageCars from './pages/ManageCars';
import ManageBookings from './pages/ManageBookings';
import Enquiries from './pages/Enquiries';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="cars" element={<Cars />} />
          <Route path="cars/:id" element={<CarDetails />} />
          <Route path="book/pre/:carId" element={<PreBook />} />
          <Route path="book/:carId" element={<Book />} />
          <Route path="finance" element={<Finance />} />
          <Route path="contact" element={<Contact />} />
          <Route path="track" element={<Track />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="cars" element={<ManageCars />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="enquiries" element={<Enquiries />} />
        </Route>
      </Routes>
    </>
  );
}
