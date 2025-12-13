import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layout/MainLayout';
import AuthLayout from '../layout/AuthLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import OAuthCallback from '../pages/Login/OAuthCallback';


// function PrivateRoute({ children }: { children: JSX.Element }) {
//   const isAuthenticated = false; // TODO: Replace with real auth logic
//   return isAuthenticated ? children : <Navigate to="/login" />;
// }

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
      {/* Example protected route */}
      {/*
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      */}
    </Routes>
  );
}
