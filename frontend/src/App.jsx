import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AdminDashboard from './pages/AdminDashboard';
import TodoList from "./pages/Todolist";
import MyGallery from './pages/MyGallery';
import Journal from "./pages/Journal";
import BudgetTracker from "./pages/BudgetTracker";
import './App.css';

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/journal" element={<Journal />} />
          <Route path="/budget" element={<BudgetTracker />} />
          <Route path="/signup" element={<Signup />} />
         <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;  