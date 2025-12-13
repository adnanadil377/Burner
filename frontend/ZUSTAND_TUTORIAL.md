# 🎓 Zustand Tutorial: From Zero to Hero

Welcome! This tutorial will teach you everything about Zustand through the implementation in this project.

## 📋 Table of Contents

1. [Installation & Setup](#1-installation--setup)
2. [Creating Your First Store](#2-creating-your-first-store)
3. [Using Stores in Components](#3-using-stores-in-components)
4. [Performance Optimization](#4-performance-optimization)
5. [Middleware & Advanced Features](#5-middleware--advanced-features)
6. [Real-World Patterns](#6-real-world-patterns)
7. [Testing & Debugging](#7-testing--debugging)

---

## 1. Installation & Setup

### Install Zustand

\`\`\`bash
npm install zustand
\`\`\`

That's it! No configuration needed. ✨

---

## 2. Creating Your First Store

### Basic Store Structure

Create a file `src/stores/useCounterStore.ts`:

\`\`\`typescript
import { create } from 'zustand';

// Define your state interface
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// Create the store
export const useCounterStore = create<CounterState>((set) => ({
  // Initial state
  count: 0,
  
  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
\`\`\`

### Understanding \`set\`

\`\`\`typescript
// Method 1: Direct object
set({ count: 0 })

// Method 2: Function (access current state)
set((state) => ({ count: state.count + 1 }))

// Method 3: Replace entire state (rarely used)
set({ count: 0 }, true)
\`\`\`

---

## 3. Using Stores in Components

### Example 1: Basic Usage

\`\`\`tsx
import { useCounterStore } from './stores/useCounterStore';

function Counter() {
  const count = useCounterStore(state => state.count);
  const increment = useCounterStore(state => state.increment);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
\`\`\`

### Example 2: Multiple Values

\`\`\`tsx
function Counter() {
  // ✅ GOOD: Destructure multiple values
  const { count, increment, decrement, reset } = useCounterStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
\`\`\`

### Example 3: In This Project - Auth Store

Check \`src/stores/useAuthStore.ts\` and see how it's used in:
- \`src/pages/Login/index.tsx\` - Login handling
- \`src/pages/Dashboard/index.tsx\` - Display user info
- \`src/routes/AppRoutes.tsx\` - Route protection

---

## 4. Performance Optimization

### Problem: Unnecessary Re-renders

\`\`\`tsx
// ❌ BAD: Component re-renders on ANY state change
function MyComponent() {
  const store = useAuthStore();
  return <div>{store.user.name}</div>;
}
\`\`\`

### Solution 1: Selector Pattern

\`\`\`tsx
// ✅ GOOD: Only re-renders when user changes
function MyComponent() {
  const user = useAuthStore(state => state.user);
  return <div>{user.name}</div>;
}
\`\`\`

### Solution 2: Multiple Selectors

\`\`\`tsx
// ✅ GOOD: Only re-renders when these specific values change
function MyComponent() {
  const { user, logout } = useAuthStore(state => ({
    user: state.user,
    logout: state.logout,
  }));
  
  return (
    <div>
      <p>{user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
\`\`\`

### Solution 3: Shallow Comparison

\`\`\`tsx
import { shallow } from 'zustand/shallow';

// Only re-renders if array items change (not just reference)
const { user, isAuth } = useAuthStore(
  state => ({ user: state.user, isAuth: state.isAuthenticated }),
  shallow
);
\`\`\`

---

## 5. Middleware & Advanced Features

### Persist Middleware (localStorage)

\`\`\`typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      login: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ token: state.token }), // only persist token
    }
  )
);
\`\`\`

**See it in action:** \`src/stores/useAuthStore.ts\`

### DevTools Middleware

\`\`\`typescript
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'CounterStore' } // Name in Redux DevTools
  )
);
\`\`\`

**See it in action:** \`src/stores/examples.ts\`

### Immer Middleware (Mutable Updates)

\`\`\`typescript
import { immer } from 'zustand/middleware/immer';

export const useStore = create(
  immer((set) => ({
    todos: [],
    addTodo: (todo) => set((state) => {
      // Mutate directly (Immer makes it immutable)
      state.todos.push(todo);
    }),
  }))
);
\`\`\`

---

## 6. Real-World Patterns

### Pattern 1: Authentication Flow

\`\`\`typescript
// Store
interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  
  login: async (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

// Component
function LoginForm() {
  const login = useAuthStore(state => state.login);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/login', { /* ... */ });
    const data = await response.json();
    await login(data.token, data.user);
    navigate('/dashboard');
  };
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
\`\`\`

**Full implementation:** \`src/stores/useAuthStore.ts\` & \`src/pages/Login/index.tsx\`

### Pattern 2: Protected Routes

\`\`\`tsx
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}
\`\`\`

**Full implementation:** \`src/routes/AppRoutes.tsx\`

### Pattern 3: Global UI State

\`\`\`typescript
interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
  
  theme: 'dark',
  toggleTheme: () => set({ 
    theme: get().theme === 'light' ? 'dark' : 'light' 
  }),
}));
\`\`\`

**Full implementation:** \`src/stores/useUIStore.ts\`

### Pattern 4: Async Data Fetching

\`\`\`typescript
interface DataState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  data: [],
  loading: false,
  error: null,
  
  fetchData: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

// Component
function DataList() {
  const { data, loading, error, fetchData } = useDataStore();
  
  useEffect(() => {
    fetchData();
  }, []);
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <List items={data} />;
}
\`\`\`

### Pattern 5: Computed Values

\`\`\`typescript
export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  
  // ❌ BAD: Store computed value (gets stale)
  completedCount: 0,
  
  // ✅ GOOD: Compute on demand
  getCompletedCount: () => {
    return get().todos.filter(t => t.completed).length;
  },
}));

// Usage
function TodoStats() {
  const getCompletedCount = useTodoStore(state => state.getCompletedCount);
  const count = getCompletedCount(); // Fresh every time
  
  return <p>Completed: {count}</p>;
}
\`\`\`

---

## 7. Testing & Debugging

### Access State Imperatively

\`\`\`typescript
// Get current state without subscribing
const currentUser = useAuthStore.getState().user;

// Set state from outside components
useAuthStore.setState({ isLoading: true });

// Subscribe to changes
const unsubscribe = useAuthStore.subscribe(
  state => state.user,
  (user) => console.log('User changed:', user)
);

// Unsubscribe when done
unsubscribe();
\`\`\`

### Redux DevTools

1. Install [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools)
2. Use \`devtools\` middleware in your store
3. Open DevTools → Redux tab
4. See all state changes, time-travel debug!

### Reset Store (Testing)

\`\`\`typescript
const initialState = {
  count: 0,
  user: null,
};

export const useStore = create((set) => ({
  ...initialState,
  reset: () => set(initialState),
}));

// In tests
beforeEach(() => {
  useStore.getState().reset();
});
\`\`\`

---

## 🎯 Quick Reference

### Common Operations

\`\`\`typescript
// Create store
const useStore = create((set, get) => ({ ... }))

// Read state
const value = useStore(state => state.value)

// Get state imperatively
const value = useStore.getState().value

// Set state imperatively
useStore.setState({ value: 123 })

// Subscribe to changes
useStore.subscribe((state) => console.log(state))

// With middleware
const useStore = create(
  persist(
    devtools((set) => ({ ... })),
    { name: 'storage-key' }
  )
)
\`\`\`

---

## 📚 Files to Study

1. **\`src/stores/useAuthStore.ts\`** - Authentication with persistence
2. **\`src/stores/useUIStore.ts\`** - UI state management
3. **\`src/stores/examples.ts\`** - Advanced patterns & todos
4. **\`src/pages/Login/index.tsx\`** - Using auth store
5. **\`src/pages/Dashboard/index.tsx\`** - Multiple stores
6. **\`src/routes/AppRoutes.tsx\`** - Protected routes

---

## 💡 Best Practices Summary

1. ✅ **Use selectors** - Pick only what you need
2. ✅ **Multiple stores** - Separate concerns
3. ✅ **Computed as functions** - Don't store derived state
4. ✅ **TypeScript** - Full type safety
5. ✅ **Middleware** - Persist, DevTools, Immer
6. ✅ **Actions in store** - Keep logic with state
7. ❌ **Don't overuse** - Local state is fine for forms
8. ❌ **Don't nest stores** - Keep flat structure

---

## 🚀 Next Steps

1. Read through the store files in \`src/stores/\`
2. Check how they're used in components
3. Try adding your own store for a new feature
4. Experiment with middleware
5. Use Redux DevTools to see state changes

---

## 🆘 Common Issues

### Issue 1: Component doesn't update

**Problem:** Using entire store instead of selector

\`\`\`tsx
// ❌ BAD
const store = useStore();

// ✅ GOOD
const value = useStore(state => state.value);
\`\`\`

### Issue 2: Too many re-renders

**Problem:** Selecting too much state

\`\`\`tsx
// ❌ BAD: Re-renders on any change
const { a, b, c, d, e } = useStore();

// ✅ GOOD: Only select what's needed
const a = useStore(state => state.a);
\`\`\`

### Issue 3: State not persisting

**Problem:** Missing persist middleware

\`\`\`tsx
// ✅ Add persist middleware
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({ ... }),
    { name: 'storage-key' }
  )
);
\`\`\`

---

**Happy coding with Zustand! 🐻✨**
