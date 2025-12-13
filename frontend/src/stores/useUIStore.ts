import { create } from 'zustand';

/**
 * 🎓 LESSON 6: Multiple Stores Pattern
 * 
 * In Zustand, it's common to create multiple stores for different concerns:
 * - useAuthStore: Authentication state
 * - useUIStore: UI-related state (modals, sidebars, themes)
 * - useDataStore: Application data
 * 
 * This keeps your code organized and prevents one giant store.
 * Components only subscribe to the stores they need.
 */

interface UIState {
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modal state
  isModalOpen: boolean;
  modalContent: string | null;
  openModal: (content: string) => void;
  closeModal: () => void;

  // Theme (if you want to add dark/light mode later)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Global loading state (for API calls, etc.)
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

/**
 * 🎓 LESSON 7: Computed Values with `get()`
 * 
 * You can use `get()` to read the current state inside actions.
 * This is useful for creating derived/computed values.
 */

export const useUIStore = create<UIState>((set, get) => ({
  // Sidebar state
  isSidebarOpen: false,
  
  toggleSidebar: () => {
    // Read current state and toggle it
    const currentState = get().isSidebarOpen;
    set({ isSidebarOpen: !currentState });
  },
  
  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open });
  },

  // Modal state
  isModalOpen: false,
  modalContent: null,
  
  openModal: (content: string) => {
    set({ 
      isModalOpen: true, 
      modalContent: content 
    });
  },
  
  closeModal: () => {
    set({ 
      isModalOpen: false, 
      modalContent: null 
    });
  },

  // Theme
  theme: 'dark', // Your app uses dark theme by default
  
  toggleTheme: () => {
    const currentTheme = get().theme;
    set({ theme: currentTheme === 'light' ? 'dark' : 'light' });
  },

  // Global loading
  globalLoading: false,
  
  setGlobalLoading: (loading: boolean) => {
    set({ globalLoading: loading });
  },
}));

/**
 * 🎓 LESSON 8: Selector Pattern for Performance
 * 
 * When you use a store, you can select only what you need:
 * 
 * ❌ BAD - Component re-renders on ANY state change:
 * const uiStore = useUIStore();
 * 
 * ✅ GOOD - Component only re-renders when theme changes:
 * const theme = useUIStore(state => state.theme);
 * 
 * ✅ ALSO GOOD - Select multiple values:
 * const { theme, toggleTheme } = useUIStore(state => ({
 *   theme: state.theme,
 *   toggleTheme: state.toggleTheme,
 * }));
 */
