import type { LucideIcon } from 'lucide-react';
import { Home, Folder, Film, Settings, LayoutGrid } from 'lucide-react';

/**
 * Navigation Configuration
 * 
 * Centralized navigation structure for easy page management.
 * To add a new page:
 * 1. Add a new entry to this array
 * 2. Create the page component
 * 3. Add the route in AppRoutes.tsx
 */

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  description?: string;
  badge?: string; // Optional badge text (e.g., "New", "Beta")
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    description: 'Overview and quick actions'
  },
  {
    id: 'editor',
    label: 'Video Editor',
    path: '/editor',
    icon: Film,
    description: 'Edit your videos with subtitles'
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: Folder,
    description: 'Browse your video projects'
  },
  {
    id: 'library',
    label: 'Library',
    path: '/library',
    icon: LayoutGrid,
    description: 'Media library and assets'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Account and preferences'
  }
];

/**
 * Get navigation item by path
 */
export const getNavigationByPath = (path: string): NavigationItem | undefined => {
  return navigationItems.find(item => item.path === path);
};

/**
 * Get page header info by path
 */
export const getPageHeaderInfo = (path: string) => {
  const item = getNavigationByPath(path);
  return {
    title: item?.label || 'Dashboard',
    description: item?.description,
    icon: item?.icon
  };
};
