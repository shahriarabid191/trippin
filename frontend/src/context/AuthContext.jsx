import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // When the app first loads, check if we saved user data in local storage
  // (The actual secure token lives invisibly in the browser's cookies)
  useEffect(() => {
    const savedUser = localStorage.getItem('trippinUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('trippinUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trippinUser');
    // In the future, you'd also make a quick fetch to /api/auth/logout to destroy the cookie
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}