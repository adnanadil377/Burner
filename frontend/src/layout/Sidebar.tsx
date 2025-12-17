import { NavLink } from 'react-router-dom';
import { Search, Plus, CheckCircle2, ChevronLeft, LogOut } from 'lucide-react';
import { navigationItems } from '../config/navigation';
import { useAuthStore } from '../stores/useAuthStore';
import { useState } from 'react';

interface SidebarProps {
  collapsed?: boolean;
}

// Group navigation items by section
const navigationSections = [
  {
    title: 'MAIN',
    items: navigationItems.filter(item => ['dashboard'].includes(item.id))
  },
  {
    title: 'CONTENT & TOOLS',
    items: navigationItems.filter(item => ['projects', 'library'].includes(item.id))
  },
  {
    title: 'WORKSPACE',
    items: navigationItems.filter(item => ['editor', 'settings'].includes(item.id))
  }
];

export default function Sidebar({ collapsed: controlledCollapsed }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const logout = useAuthStore(state => state.logout);
  
  const collapsed = controlledCollapsed ?? internalCollapsed;

  const handleLogout = () => {
    logout();
  };

  return (
    <aside 
      className={`
        bg-white border-r border-neutral-200 
        flex flex-col transition-all duration-300 ease-in-out overflow-y-auto overflow-x-visible relative
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-neutral-200">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">🔥</span>
            </div>
            <span className="text-neutral-900 font-semibold text-base">Burner</span>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">🔥</span>
          </div>
        )}
      </div>

      {/* Floating Collapse Toggle Button */}
      <button
        onClick={() => setInternalCollapsed(!collapsed)}
        className="absolute top-20 -right-3.5 z-[100] w-7 h-7 rounded-full bg-white border-2 border-neutral-300 
                   flex items-center justify-center shadow-lg hover:shadow-xl
                   text-neutral-700 hover:text-neutral-900 hover:border-emerald-500
                   transition-all duration-200 hover:scale-110"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft 
          size={14} 
          className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Search Bar */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-3">
          <div className="relative">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg
                       text-neutral-900 placeholder:text-neutral-400
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                       transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 py-2 px-3 space-y-5 overflow-y-auto">
        {navigationSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {!collapsed && (
              <div className="px-3 mb-2">
                <h3 className="text-[11px] font-semibold text-neutral-400 tracking-wide uppercase">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon 
                          size={20} 
                          className={isActive ? 'text-emerald-600' : ''}
                        />
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.label}</span>
                        )}
                        {item.badge && !collapsed && (
                          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-semibold">
                            {item.badge}
                          </span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-neutral-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[99999] transition-opacity shadow-lg">
                            {item.label}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}


      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="p-4 border-t border-neutral-200 space-y-3">
          <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-neutral-700">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span className="font-medium text-sm">Credits</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-semibold">1 / 10 Used</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full w-[10%] bg-emerald-500 rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                     text-neutral-600 hover:bg-red-50 hover:text-red-600 border border-neutral-200
                     transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
