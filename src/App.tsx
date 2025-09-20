import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import PasswordChangeForm from './components/PasswordChangeForm';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, isAuthenticated, requiresPasswordChange } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (requiresPasswordChange) {
    return <PasswordChangeForm />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;