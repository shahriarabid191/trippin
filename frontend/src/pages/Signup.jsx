import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5050/api/auth/register', {
        method: 'POST',
        credentials:"include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, adminCode })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        navigate('/');
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join Trippin to save your anchors.</p>
        
        <form className="auth-form" onSubmit={handleSignup}>
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

          {showAdminCode && (
            <input 
              type="text" 
              placeholder="Secret Admin Code" 
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="auth-input"
              style={{ borderColor: '#0d79bd' }}
            />
          )}
          
          <button type="submit" className="auth-button">
            Sign Up
          </button>
        </form>

        <button className="auth-link" onClick={() => setShowAdminCode(!showAdminCode)}>
          Registering as Staff?
        </button>
      </div>
    </div>
  );
}