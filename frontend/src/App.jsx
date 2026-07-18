import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Itinerary from './pages/Itinerary';
import Gallery from './pages/Gallery';
import Booking from './pages/Booking';
import TodoList from './pages/TodoList';
import Vault from './pages/Vault';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import TodoList from "./pages/Todolist";
import Journal from "./pages/Journal";
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
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/todos" element={<TodoList />} />
          <Route path="/signup" element={<Signup />} />
         <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/todos" element={<TodoList/>} />
          <Route path="/journal" element={<Journal/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;