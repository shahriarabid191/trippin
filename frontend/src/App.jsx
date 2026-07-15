import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Booking from './pages/Booking';
import Home from './pages/Home';
import Login from './pages/Login';
import Vault from './pages/Vault';
import Itinerary from './pages/Itinerary';
import Gallery from './pages/Gallery';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        
        <div className="page-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;