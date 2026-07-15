import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Itinerary from './pages/Itinerary';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navbar sits outside the Routes so it always displays */}
        <Navbar />
        
        <div className="page-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/itinerary" element={<Itinerary />} />
            {/* Add Vault and Gallery routes here later */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;