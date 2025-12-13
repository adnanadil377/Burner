import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-700">
      <div className="w-full bg-white/90 dark:bg-neutral-800/90 rounded-xl shadow-2xl">
        <Outlet />
      </div>
    </div>
  );
}
