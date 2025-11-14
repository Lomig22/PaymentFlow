import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ReceivableForm from "../components/receivables/ReceivableForm";
import AppHeader from "../components/AppHeader";

import { User } from "@supabase/supabase-js";
import AuthMFA from "../components/AuthMFA";

interface AppRoutesProps {
  user: User | null;
  mfaRequired?: boolean;
  onMFASuccess?: () => void;
}

export default function AppRoutes({ user, onMFASuccess }: AppRoutesProps) {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const qs = new URLSearchParams(search);
  const onboardingSuffix = qs.get("onboarding") === "1" ? "?onboarding=1" : "";
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  return (
    <Router>
      {!user && <AppHeader user={user} />}

      <Routes>
        {/* Routes publiques */}
        {/* /subscribe route removed (SubscribePage absent) */}

        {/* Routes protégées */}
        <Route
          path="/"
        >
          <Route
            path="mfa"
            element={<AuthMFA />}
          />
          <Route path="receivables/new" element={<ReceivableForm onClose={() => { }} onReceivableAdded={() => { }} />} />
        </Route>
      </Routes>
    </Router>
  );
}
