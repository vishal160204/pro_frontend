import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import OTPVerification from './components/OTPVerification';
import Dashboard from './components/Dashboard';
import Practice from './components/Practice';
import Analytics from './components/Analytics';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import EverydayConversationWithRecording from './components/EverydayConversationWithRecording';
function Header() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify-otp';
  const isDashboardPage = location.pathname === '/dashboard';
  const isPracticePage = location.pathname === '/practice';
  const isAnalyticsPage = location.pathname === '/analytics';
  const isConversationPage = location.pathname === '/everyday-conversation';
  
  if (isAuthPage || isDashboardPage || isPracticePage || isAnalyticsPage || isConversationPage) {
    return null; // Don't show header on auth pages, dashboard, practice, analytics, or conversation page
  }

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <div className="logo-icon">CC</div>
          <span className="logo-text">CommuniCoach Pro</span>
        </Link>
        <nav className="nav">
          <Link to="/login" className="btn-secondary">Sign In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/practice" element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/everyday-conversation" element={<EverydayConversationWithRecording />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
