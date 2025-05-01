import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase, checkAuth } from "./lib/supabase";
import { User } from "@supabase/supabase-js";

import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import Layout from "./components/Layout";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";
import ReceivablesList from "./components/receivables/ReceivablesList";
import Settings from "./components/settings/Settings";
import ClientPage from "./components/clients/ClientPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import PricingPage from "./pages/PricingPage";
import AppHeader from "./components/AppHeader";
import ContactPage from "./pages/ContactPage";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await checkAuth();
        setUser(session?.user ?? null);
    
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

    });

    return () => subscription?.unsubscribe();
  }, []);
  useEffect(() => {
    const CHATLING_SCRIPT_ID = "chatling-embed-script";
  
    let observer: MutationObserver | null = null;
  
    const removeChatlingElements = () => {
      // Supprime le script
      const script = document.getElementById(CHATLING_SCRIPT_ID);
      if (script) script.remove();
  
      // Supprime la config globale
      delete window.chtlConfig;
  
      // Supprime les iframes
      const iframe = document.querySelector("iframe[src*='chatling']");
      if (iframe) iframe.remove();
  
      // Supprime les boutons flottants Chatling
      const chatlingButtonContainer = Array.from(document.querySelectorAll("div"))
        .find(div => div.style.position === "fixed" && div.innerHTML.includes("chatling-open-chat-icon"));
      if (chatlingButtonContainer) chatlingButtonContainer.remove();
    };
  
    if (!user) {
      // Ajouter le script si non connecté
      if (!document.getElementById(CHATLING_SCRIPT_ID)) {
        const script = document.createElement("script");
        script.src = "https://chatling.ai/js/embed.js";
        script.async = true;
        script.id = CHATLING_SCRIPT_ID;
        script.setAttribute("data-id", "4596411993");
        document.body.appendChild(script);
  
        window.chtlConfig = { chatbotId: "4596411993" };
      }
    } else {
      removeChatlingElements();
  
      // Observer si quelque chose est injecté après coup
      observer = new MutationObserver(() => {
        const iframe = document.querySelector("iframe[src*='chatling']");
        const chatIcon = document.getElementById("chatling-open-chat-icon");
  
        if (iframe || chatIcon) {
          removeChatlingElements();
          if (observer) observer.disconnect();
        }
      });
  
      observer.observe(document.body, { childList: true, subtree: true });
    }
  
    return () => {
      if (observer) observer.disconnect();
    };
  }, [user]);
  
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      {!user && <AppHeader user={user} onContactClick={() => {}} />}
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!user?<LandingPage onGetStarted={() => {}} />: <Navigate to="/dashboard" replace />} />
        <Route
          path="/signup"
          element={
            !user ? <SignupPage /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Auth-protected routes */}
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard">
            <Route
              index
              element={
                <Navigate
                  to={`/dashboard/${encodeURIComponent(user?.email || "")}`}
                  replace
                />
              }
            />
            <Route path=":email" element={<Dashboard user={user} />} />
          </Route>

          <Route path="/clients" element={<ClientPage />} />
          <Route path="/receivables" element={<ReceivablesList />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Redirects */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
