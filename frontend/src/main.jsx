import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' // <-- Import the provider
import './index.css' // Or whatever your global CSS file is named

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the App component so every page has access to the login state */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)