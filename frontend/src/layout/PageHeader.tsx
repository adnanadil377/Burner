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
    <div className="bg-neutral-950 px-8 pt-6 pb-2 border-b border-neutral-900">
      <div className="flex items-center justify-between">
        {/* Left: Page Title with Icon */}
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'serif' }}>
            {displayTitle}
          </h1>
        </div>
        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
}
