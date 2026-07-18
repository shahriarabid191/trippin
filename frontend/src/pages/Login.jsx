import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5050/api/auth/login', {
        method: 'POST',
        credentials:"include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        navigate('/');
      } else {
        alert(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to manage your anchor.</p>
        
        <form className="auth-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>

        <button className="auth-link" onClick={() => navigate('/signup')}>
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
}