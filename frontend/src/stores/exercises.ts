/**
 * 🎮 ZUSTAND INTERACTIVE PLAYGROUND
 * 
 * This file contains mini-exercises to help you learn Zustand.
 * Each exercise has:
 * - 📝 Instructions
 * - 💡 Hints
 * - ✅ Solution
 * 
 * Try to solve each before looking at the solution!
 */

import { create } from 'zustand';

// ============================================
// 🎯 EXERCISE 1: Create a Counter Store
// ============================================

/**
 * 📝 Task: Create a counter store with:
 * - count: number (initial value: 0)
 * - increment: () => void
 * - decrement: () => void
 * - reset: () => void
 * - incrementBy: (amount: number) => void
 */

// 💡 Hint: Use create() and TypeScript interface

// ✅ SOLUTION:
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (amount: number) => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
}));

// ============================================
// 🎯 EXERCISE 2: Shopping Cart Store
// ============================================

/**
 * 📝 Task: Create a shopping cart store with:
 * - items: Array<{ id: string, name: string, price: number, quantity: number }>
 * - addItem: (item) => void
 * - removeItem: (id) => void
 * - updateQuantity: (id, quantity) => void
 * - clearCart: () => void
 * - getTotal: () => number (computed value)
 */

// 💡 Hint: Use get() for computed values

// ✅ SOLUTION:
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find((i) => i.id === item.id);
    
    if (existingItem) {
      // Update quantity if item exists
      set({
        items: items.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      // Add new item
      set({ items: [...items, item] });
    }
  },
  
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  
  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    const items = get().items;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));

// ============================================
// 🎯 EXERCISE 3: Async Data Fetching
// ============================================

/**
 * 📝 Task: Create a user store that fetches data from an API:
 * - users: User[]
 * - loading: boolean
 * - error: string | null
 * - fetchUsers: () => Promise<void>
 * - searchUsers: (query: string) => User[]
 */

// 💡 Hint: Use async/await and try/catch

// ✅ SOLUTION:
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  searchUsers: (query: string) => User[];
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();
      set({ users, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        loading: false,
      });
    }
  },
  
  searchUsers: (query) => {
    const users = get().users;
    const lowerQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    );
  },
}));

// ============================================
// 🎯 EXERCISE 4: Persist to localStorage
// ============================================

/**
 * 📝 Task: Create a settings store that persists to localStorage:
 * - theme: 'light' | 'dark'
 * - language: string
 * - notifications: boolean
 * - toggleTheme: () => void
 * - setLanguage: (lang: string) => void
 * - toggleNotifications: () => void
 */

// 💡 Hint: Use persist middleware

// ✅ SOLUTION:
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  toggleTheme: () => void;
  setLanguage: (lang: string) => void;
  toggleNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'en',
      notifications: true,
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        set({ theme: currentTheme === 'light' ? 'dark' : 'light' });
      },
      
      setLanguage: (lang) => set({ language: lang }),
      
      toggleNotifications: () => {
        const current = get().notifications;
        set({ notifications: !current });
      },
    }),
    {
      name: 'app-settings', // localStorage key
    }
  )
);

// ============================================
// 🎯 EXERCISE 5: Multiple Stores Pattern
// ============================================

/**
 * 📝 Task: Create a notification system with TWO stores:
 * 
 * 1. useNotificationStore:
 *    - notifications: Array<{ id, message, type }>
 *    - addNotification: (message, type) => void
 *    - removeNotification: (id) => void
 * 
 * 2. useNotificationSettingsStore:
 *    - enabled: boolean
 *    - duration: number (ms)
 *    - position: 'top' | 'bottom'
 */

// 💡 Hint: Create two separate stores

// ✅ SOLUTION:

// Store 1: Notifications
interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (message: string, type: Notification['type']) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (message, type) => {
    const id = Date.now().toString();
    const notification: Notification = { id, message, type };
    
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

// Store 2: Notification Settings
interface NotificationSettingsState {
  enabled: boolean;
  duration: number;
  position: 'top' | 'bottom';
  toggleEnabled: () => void;
  setDuration: (duration: number) => void;
  setPosition: (position: 'top' | 'bottom') => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set, get) => ({
      enabled: true,
      duration: 5000,
      position: 'top',
      
      toggleEnabled: () => set({ enabled: !get().enabled }),
      setDuration: (duration) => set({ duration }),
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'notification-settings',
    }
  )
);

// ============================================
// 🎯 EXERCISE 6: Component Usage
// ============================================

/**
 * 📝 Task: Write a React component that uses the counter store
 * 
 * Requirements:
 * - Display current count
 * - Button to increment
 * - Button to decrement
 * - Button to reset
 * - Input to increment by custom amount
 * - Should be optimized (minimal re-renders)
 */

// 💡 Hint: Use selectors to get only what you need

// ✅ SOLUTION:
/*
import { useCounterStore } from './exercises';

function CounterComponent() {
  // Optimize: Only get what we need
  const count = useCounterStore(state => state.count);
  const { increment, decrement, reset, incrementBy } = useCounterStore();
  
  const [customAmount, setCustomAmount] = React.useState('5');
  
  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Counter: {count}</h2>
      
      <div className="space-x-2 mb-4">
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>Reset</button>
      </div>
      
      <div>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="px-2 py-1 rounded"
        />
        <button onClick={() => incrementBy(Number(customAmount))}>
          Add {customAmount}
        </button>
      </div>
    </div>
  );
}
*/

// ============================================
// 🎓 PRACTICE CHALLENGES
// ============================================

/**
 * Try implementing these on your own:
 * 
 * 1. ⭐ Todo Store with filters (all, active, completed)
 * 2. ⭐⭐ Authentication store with token refresh
 * 3. ⭐⭐ Form store with validation and error handling
 * 4. ⭐⭐⭐ Undo/Redo functionality
 * 5. ⭐⭐⭐ Real-time chat store with WebSocket
 * 
 * Bonus: Add DevTools middleware to debug!
 */

// ============================================
// 🎯 YOUR TURN!
// ============================================

/**
 * Create your own store below:
 * Think about what state your app needs and implement it!
 */

// Your code here...

/**
 * 🎉 Congratulations!
 * 
 * You've completed the Zustand exercises.
 * You now understand:
 * - Creating stores
 * - State and actions
 * - Async operations
 * - Persistence
 * - Multiple stores
 * - Component usage
 * 
 * Next steps:
 * 1. Try the practice challenges
 * 2. Build something with Zustand
 * 3. Explore advanced middleware
 * 4. Share what you learned!
 */
