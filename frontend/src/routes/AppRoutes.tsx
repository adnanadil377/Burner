import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

import MainLayout from '../layout/MainLayout';
import AuthLayout from '../layout/AuthLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import OAuthCallback from '../pages/Login/OAuthCallback';
import Dashboard from '../pages/Dashboard';

/**
 * 🎓 ZUSTAND IN ROUTING: PrivateRoute Component
 * 
 * Instead of checking localStorage directly, we use Zustand.
 * This allows us to:
 * 1. Have a single source of truth for auth state
 * 2. React to auth changes across the entire app
 * 3. Keep routing logic clean and testable
 */
function PrivateRoute({ children }: { children: ReactNode }) {
  // ✨ ZUSTAND: Get auth state from store
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const hasHydrated = useAuthStore(state => state._hasHydrated);
  
  // Wait for hydration before redirecting
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
      </Route>
      {/* Protected dashboard route - No layout needed as Dashboard has its own styling */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}
