import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import PasswordChangeForm from './components/PasswordChangeForm';
import Dashboard from './components/Dashboard';
import type { AuthResponse, User } from './types/auth';

type AppState = 'login' | 'passwordChange' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setAuthToken(savedToken);
        setUser(JSON.parse(savedUser));
        setAppState('dashboard');
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLoginSuccess = (authData: AuthResponse) => {
    if (authData.user && authData.token) {
      setUser(authData.user);
      setAuthToken(authData.token);
      
      if (authData.requirePasswordChange) {
        setAppState('passwordChange');
      } else {
        localStorage.setItem('authToken', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        setAppState('dashboard');
      }
    }
  };

  const handlePasswordChanged = () => {
    if (user && authToken) {
      const updatedUser = { ...user, first_login: false };
      setUser(updatedUser);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAppState('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setAuthToken(null);
    setAppState('login');
  };

  switch (appState) {
    case 'login':
      return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    
    case 'passwordChange':
      return user ? (
        <PasswordChangeForm
          userEmail={user.email}
          userRole={user.role}
          onPasswordChanged={handlePasswordChanged}
        />
      ) : null;
    
    case 'dashboard':
      return user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : null;
    
    default:
      return null;
  }
}

export default App;