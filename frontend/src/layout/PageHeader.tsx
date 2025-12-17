import { useLocation, useNavigate } from 'react-router-dom';
import { getPageHeaderInfo } from '../config/navigation';
import { ChevronLeft, ChevronRight, Sun, Bell, Undo, Redo } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  variant?: 'default' | 'editor';
  logo?: ReactNode;
}

/**
 * PageHeader Component
 * 
 * Displays a consistent header across all dashboard pages.
 * Automatically pulls title/description from navigation config if not provided.
 */
export default function PageHeader({ title, actions, variant = 'default', logo }: PageHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const headerInfo = getPageHeaderInfo(location.pathname);
  
  const displayTitle = title || headerInfo.title;
  const Icon = headerInfo.icon;

  if (variant === 'editor') {
    return (
      <header className="border-b border-zinc-200 bg-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo || (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white rounded"></div>
                </div>
                <h1 className="text-xl font-bold text-zinc-900">
                  CaptionBurn
                </h1>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
              <Undo className="w-5 h-5 text-zinc-600" />
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
              <Redo className="w-5 h-5 text-zinc-600" />
            </button>
            {actions}
            <button className="w-9 h-9 bg-amber-100 hover:bg-amber-200 rounded-full flex items-center justify-center transition-colors">
              <span className="text-sm">👤</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Page Title with Icon */}
        <div className="flex items-center gap-4">
          {/* Page Info */}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Icon size={20} className="text-gray-600" />
              </div>
            )}
            <h1 className="text-xl font-semibold text-neutral-900">
              {displayTitle}
            </h1>
          </div>
        </div>

        {/* Right: Actions + Navigation + Theme + Notifications + Profile */}
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
}
