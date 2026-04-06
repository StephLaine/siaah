import React from 'react';
import AppRoutes from './routes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

const AppContent = () => {
  const { loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center text-primary-600 font-bold">
      Chargement...
    </div>
  );
  return <AppRoutes />;
};

function App() {
  return (
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
