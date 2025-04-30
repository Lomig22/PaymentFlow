import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { supabase, checkAuth } from './lib/supabase';
import { User } from '@supabase/supabase-js';

import LandingPage from './components/LandingPage';
import Auth from './components/Auth';  // Auth importée pour la gestion d'authentification
import Layout from './components/Layout';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import ReceivablesList from './components/receivables/ReceivablesList';
import Settings from './components/settings/Settings';
import ClientPage from './components/clients/ClientPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Import des styles de ToastContainer
import AppHeader from './components/AppHeader';  // Assurer que le header est inclus

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await checkAuth();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isResetPasswordPage = window.location.href.includes('type=recovery');
  if (isResetPasswordPage) {
    return <ResetPassword />;
  }

  if (!user && showAuth) {
    return <Auth onClose={() => setShowAuth(false)} />;
  }

  if (!user) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <Router>
      {/* Affichage du ToastContainer pour les notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />

      {/* Affichage du header pour toutes les pages */}
      <AppHeader user={user} />

      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/clients" element={<ClientPage />} />
        <Route path="/receivables" element={<ReceivablesList />} />
        <Route path="/settings" element={<Settings />} />
        {/* Routes protégées */}
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        {/* Redirections */}
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
