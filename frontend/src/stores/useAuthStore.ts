import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 🎓 ZUSTAND LESSON 1: What is Zustand?
 * 
 * Zustand is a lightweight state management library for React.
 * Think of it as a simpler alternative to Redux or Context API.
 * 
 * Key benefits:
 * - No boilerplate code (unlike Redux)
 * - No providers needed (unlike Context)
 * - Simple, intuitive API
 * - Built-in TypeScript support
 * - Automatic re-renders when state changes
 */

/**
 * 🎓 LESSON 2: Defining the Store Interface
 * 
 * First, we define TypeScript interfaces for our state and actions.
 * This gives us type safety and autocomplete.
 */

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  // STATE: These are the values we want to track
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean; // Track if persist has loaded

  // ACTIONS: These are functions that modify the state
  login: (token: string, user?: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

/**
 * 🎓 LESSON 3: Creating the Store with `create()`
 * 
 * The `create()` function from Zustand creates our store.
 * We pass it a function that receives `set` and `get`:
 * - `set`: Updates the state
 * - `get`: Reads the current state
 * 
 * The `persist` middleware automatically saves state to localStorage
 * and restores it when the app loads. Perfect for auth tokens!
 */

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      // Initial state values - will be overwritten by persisted state if it exists
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      /**
       * 🎓 LESSON 4: Action Functions
       * 
       * These functions use `set()` to update the state.
       * You can update multiple state values at once.
       * Components automatically re-render when state changes.
       */

      login: (token: string, user?: User) => {
        // Save token to localStorage for persistence (backup)
        localStorage.setItem('access_token', token);
        
        // Update multiple state values at once
        set({
          token,
          user: user || null,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem('access_token');
        
        // Reset all auth-related state
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage', // Key in localStorage
      // Persist token, user, and auth status
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * 🎓 LESSON 5: Using the Store in Components
 * 
 * To use this store in a component:
 * 
 * ```tsx
 * import { useAuthStore } from '@/stores/useAuthStore';
 * 
 * function MyComponent() {
 *   // Select only the state you need (prevents unnecessary re-renders)
 *   const { isAuthenticated, login, logout } = useAuthStore();
 *   
 *   // Or select specific values
 *   const isAuthenticated = useAuthStore(state => state.isAuthenticated);
 *   
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <button onClick={logout}>Logout</button>
 *       ) : (
 *         <button onClick={() => login('token123')}>Login</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
