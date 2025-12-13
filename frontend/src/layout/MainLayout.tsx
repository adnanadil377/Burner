import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/LandingPage/Navbar';

// MainLayout: For public pages (e.g., landing, home)
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <Outlet />
      </main>
      {/* Add Footer here if needed */}
    </div>
  );
}
