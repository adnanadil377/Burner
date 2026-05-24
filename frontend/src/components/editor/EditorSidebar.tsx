import { Clock, Monitor, Type, Sparkles, Palette, Layout, Box, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DrawerTab } from './SubtitleDrawer';

interface EditorSidebarProps {
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
}

const EditorSidebar = ({
  activeTab,
  onTabChange,
  onNavigatePrev,
  onNavigateNext,
  canNavigatePrev,
  canNavigateNext,
}: EditorSidebarProps) => {
  const sidebarTabs = [
    { key: 'timeline', icon: Clock, title: 'Timeline', shadow: 'shadow-lash-900/30' },
    { key: 'resolution', icon: Monitor, title: 'Resolution', shadow: 'shadow-violet-500/30' },
    { key: 'text', icon: Type, title: 'Text', shadow: 'shadow-' },
    { key: 'presets', icon: Sparkles, title: 'Presets', shadow: 'shadow-lash-900/30' },
    { key: 'style', icon: Palette, title: 'Style', shadow: 'shadow-lash-900/30' },
    { key: 'position', icon: Layout, title: 'Position', shadow: 'shadow-lash-900/30' },
    { key: 'animation', icon: Box, title: 'Animation', shadow: 'shadow-lash-900/30' },
  ];

  return (
    <div className="w-48 bg-zinc-800 border-r border-zinc-800 flex flex-col items-center py-6 gap-3 z-10 m-8 rounded-lg">
      {sidebarTabs.map(({ key, icon: Icon, title, shadow }) => (
        <button
          key={key}
          onClick={() => onTabChange(key as DrawerTab)}
          className={`group flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-all ${
            activeTab === key
              ? `bg-lash-900 text-white shadow-lg ${shadow}`
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title={title}
        >
          <Icon className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide" style={{letterSpacing: '0.02em'}}>{title}</span>
        </button>
      ))}

      {/* Navigation Controls */}
      <div className="mt-auto flex gap-3 pt-6 border-t border-zinc-800 w-full px-2">
        <button
          onClick={onNavigatePrev}
          disabled={!canNavigatePrev}
          className="p-2 w-full flex justify-center rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Previous subtitle"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNavigateNext}
          disabled={!canNavigateNext}
          className="p-2 w-full flex justify-center rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next subtitle"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default EditorSidebar;
