import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        // The browser will automatically save the HTTP-Only cookie sent by the backend!
        navigate('/'); // Redirect to dashboard
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-24">
      <div className="glass-panel rounded-2xl p-10 max-w-md w-full mx-4 shadow-lg border border-outline-variant/30">
        <h2 className="text-3xl font-bold text-primary mb-2 text-center">Welcome Back</h2>
        <p className="text-on-surface-variant text-center mb-8">Sign in to manage your anchor.</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 focus:border-primary outline-none transition-colors"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 focus:border-primary outline-none transition-colors"
            required
          />
          <button 
            type="submit" 
            className="bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}