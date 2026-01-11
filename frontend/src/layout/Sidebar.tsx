import { NavLink } from 'react-router-dom';
import { LogOut, CreditCard, Folder, Settings } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useState } from 'react';

// Custom navigation for Projects, Billing, Settings only
const navItems = [
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: Folder,
  },
  {
    id: 'billing',
    label: 'Billing',
    path: '/billing',
    icon: CreditCard,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const logout = useAuthStore(state => state.logout);

  return (
    <aside
      className={`
        h-screen flex flex-col justify-between
        bg-neutral-950 border-r border-neutral-800
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        overflow-y-auto relative
      `}
    >
      {/* Top: Logo */}
      <div className="flex items-center h-20 px-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
            <span className="text-white text-2xl font-bold">🔥</span>
          </div>
          {!collapsed && (
            <span className="text-white font-extrabold text-xl tracking-tight" style={{ fontFamily: 'serif' }}>
              Burner.ai
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-2 py-8 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                group flex items-center gap-4 px-4 py-3 rounded-xl
                font-semibold text-base tracking-tight
                transition-all duration-200
                ${isActive ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-200 hover:bg-neutral-900 hover:text-white'}
                ${collapsed ? 'justify-center px-2' : ''}
              `}
            >
              <Icon size={22} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {/* Tooltip for collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[99999] transition-opacity shadow-lg">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: User info and logout */}
      <div className="px-6 py-5 border-t border-neutral-800 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-400 font-bold text-lg">
            U
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">User</span>
              <span className="text-neutral-400 text-xs">Free Plan</span>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
            text-neutral-400 hover:bg-red-600/10 hover:text-red-400 border border-neutral-800
            transition-all duration-200"
        >
          <LogOut size={18} />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-24 -right-3.5 z-50 w-7 h-7 rounded-full bg-neutral-950 border-2 border-neutral-800 flex items-center justify-center shadow-lg hover:shadow-xl text-neutral-400 hover:text-white hover:border-emerald-500 transition-all duration-200 hover:scale-110"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ right: collapsed ? '-18px' : '-18px' }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}><path d="M13 15L8 10L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </aside>
  );
}
