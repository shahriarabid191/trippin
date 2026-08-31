import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Login from './pages/Login';
import Itinerary from './pages/Itinerary';
import Gallery from './pages/Gallery';
import Booking from './pages/Booking';
import HotelDetails from './pages/HotelDetails';
import Vault from './pages/Vault';
import Signup from './pages/Signup';
import TodoList from "./pages/Todolist";
import SOS from "./pages/SOS";
import MyGallery from './pages/MyGallery';
import Journal from "./pages/Journal";
import BudgetTracker from "./pages/BudgetTracker";
import Translate from "./pages/Translate";
import TravelBuddies from "./pages/Buddy";
import BookGuide from "./pages/BookGuide";
import BookCar from "./pages/BookCar";
import SimShops from "./pages/SimShops";

// --- Admin panel ---
import AdminLayout from './admin/components/AdminLayout';
import Overview from './admin/pages/Overview';
import Emergency from './admin/pages/Emergency';
import Listings from './admin/pages/Listings';
import Bookings from './admin/pages/Bookings';
import Users from './admin/pages/Users';
import UserDetail from './admin/pages/UserDetail';
import ModerationGallery from './admin/pages/ModerationGallery';
import ModerationReviews from './admin/pages/ModerationReviews';
import ModerationJournals from './admin/pages/ModerationJournals';
import AdminSimShops from './admin/pages/SimShops';
import Payments from './admin/pages/Payments';
import AiActivity from './admin/pages/AiActivity';

import './App.css';

function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="listings/hotels" element={<Listings kind="hotels" />} />
          <Route path="listings/guides" element={<Listings kind="guides" />} />
          <Route path="listings/cars" element={<Listings kind="cars" />} />
          <Route path="sim-shops" element={<AdminSimShops />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="moderation/gallery" element={<ModerationGallery />} />
          <Route path="moderation/reviews" element={<ModerationReviews />} />
          <Route path="moderation/journals" element={<ModerationJournals />} />
          <Route path="payments" element={<Payments />} />
          <Route path="ai" element={<AiActivity />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="root-layout">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/my-gallery" element={<MyGallery />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/todos" element={<TodoList />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/travel-buddies" element={<TravelBuddies />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/budget" element={<BudgetTracker />} />
        <Route path="/translate" element={<Translate />} />
        <Route path="/guides" element={<BookGuide />} />
        <Route path="/cars" element={<BookCar />} />
        <Route path="/sim-shops" element={<SimShops />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
