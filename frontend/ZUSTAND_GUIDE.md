# 🐻 Zustand State Management Guide

This project uses **Zustand** for state management - a lightweight, modern alternative to Redux and Context API.

## 📚 Table of Contents

- [What is Zustand?](#what-is-zustand)
- [Why Zustand?](#why-zustand)
- [Project Structure](#project-structure)
- [Available Stores](#available-stores)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

---

## What is Zustand?

Zustand is a small, fast, and scalable state management solution. The name "Zustand" is German for "state."

### Key Features

- ✅ **Simple API** - No boilerplate code
- ✅ **No Providers** - No wrapping your app in context providers
- ✅ **TypeScript First** - Full type safety out of the box
- ✅ **Tiny Bundle** - Only ~1KB gzipped
- ✅ **DevTools** - Redux DevTools integration
- ✅ **Persistence** - Built-in localStorage support

---

## Why Zustand?

### vs Redux

```tsx
// ❌ Redux - Lots of boilerplate
const INCREMENT = 'INCREMENT';
const increment = () => ({ type: INCREMENT });
const reducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT: return state + 1;
    default: return state;
  }
};
// Need provider, connect, mapStateToProps...

// ✅ Zustand - Simple and clean
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### vs Context API

```tsx
// ❌ Context API - Provider hell and performance issues
<AuthProvider>
  <ThemeProvider>
    <UserProvider>
      <App />
    </UserProvider>
  </ThemeProvider>
</AuthProvider>

// ✅ Zustand - No providers needed!
<App />
```

---

## Project Structure

```
frontend/src/stores/
├── useAuthStore.ts      # Authentication state (login, user, token)
├── useUIStore.ts        # UI state (modals, sidebar, theme)
└── examples.ts          # Advanced patterns and tutorials
```

---

## Available Stores

### 🔐 useAuthStore

Manages authentication state across your app.

**State:**
- `user` - Current user object
- `token` - JWT access token
- `isAuthenticated` - Boolean auth status
- `isLoading` - Loading state for auth operations
- `error` - Error messages

**Actions:**
- `login(token, user?)` - Log in a user
- `logout()` - Log out and clear state
- `setUser(user)` - Update user info
- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error message

**Example:**
```tsx
import { useAuthStore } from '@/stores/useAuthStore';

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### 🎨 useUIStore

Manages UI-related state.

**State:**
- `isSidebarOpen` - Sidebar visibility
- `isModalOpen` - Modal visibility
- `modalContent` - Modal content
- `theme` - Current theme ('light' | 'dark')
- `globalLoading` - Global loading indicator

**Actions:**
- `toggleSidebar()` - Toggle sidebar
- `openModal(content)` - Open modal with content
- `closeModal()` - Close modal
- `toggleTheme()` - Switch between light/dark

**Example:**
```tsx
import { useUIStore } from '@/stores/useUIStore';

function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  
  return (
    <div className={isSidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </div>
  );
}
```

---

## Usage Examples

### Basic Usage

```tsx
import { useAuthStore } from '@/stores/useAuthStore';

function LoginButton() {
  const login = useAuthStore(state => state.login);
  
  return (
    <button onClick={() => login('token123')}>
      Login
    </button>
  );
}
```

### Multiple Values (Optimized)

```tsx
// ✅ GOOD - Only re-renders when these specific values change
const { user, logout } = useAuthStore(state => ({
  user: state.user,
  logout: state.logout,
}));

// ❌ BAD - Re-renders on ANY state change
const authStore = useAuthStore();
```

### Selector Pattern

```tsx
// Only re-render when isAuthenticated changes
const isAuthenticated = useAuthStore(state => state.isAuthenticated);

// Compute derived values
const isAdmin = useAuthStore(state => 
  state.user?.role === 'admin'
);
```

### Async Actions

```tsx
const handleLogin = async () => {
  const { setLoading, setError, login } = useAuthStore.getState();
  
  setLoading(true);
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    login(data.token, data.user);
  } catch (error) {
    setError('Login failed');
  } finally {
    setLoading(false);
  }
};
```

---

## Best Practices

### 1. ✅ Select Only What You Need

```tsx
// ✅ GOOD - Minimal re-renders
const logout = useAuthStore(state => state.logout);

// ❌ BAD - Re-renders on all changes
const store = useAuthStore();
const logout = store.logout;
```

### 2. ✅ Use Multiple Stores

```tsx
// ✅ GOOD - Separate concerns
const useAuthStore = create(...);
const useUIStore = create(...);
const useDataStore = create(...);

// ❌ BAD - One giant store
const useAppStore = create(...); // Everything in one store
```

### 3. ✅ Computed Values as Functions

```tsx
// ✅ GOOD - Calculate on demand
getFilteredTodos: () => {
  const { todos, filter } = get();
  return todos.filter(todo => /* ... */);
}

// ❌ BAD - Store computed values
filteredTodos: [] // Will get stale
```

### 4. ✅ TypeScript Interfaces

```tsx
// ✅ GOOD - Type safety
interface AuthState {
  user: User | null;
  login: (token: string) => void;
}

const useAuthStore = create<AuthState>()(...);
```

### 5. ✅ Middleware for Features

```tsx
// Persistence
import { persist } from 'zustand/middleware';

// DevTools
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set) => ({ ... }),
      { name: 'my-store' }
    )
  )
);
```

---

## Common Patterns

### Pattern 1: Protected Route

```tsx
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}
```

### Pattern 2: Loading States

```tsx
function DataComponent() {
  const { data, loading, fetchData } = useDataStore();
  
  useEffect(() => {
    fetchData();
  }, []);
  
  if (loading) return <Spinner />;
  return <div>{data}</div>;
}
```

### Pattern 3: Form Handling

```tsx
function LoginForm() {
  const { login, error, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <button disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Pattern 4: Subscribing Outside React

```tsx
// Listen to changes outside components
useAuthStore.subscribe(
  state => state.isAuthenticated,
  (isAuth) => {
    console.log('Auth changed:', isAuth);
    // Track analytics, sync with backend, etc.
  }
);
```

### Pattern 5: Getting State Imperatively

```tsx
// Access state without subscribing
const currentUser = useAuthStore.getState().user;

// Set state imperatively
useAuthStore.setState({ isLoading: true });
```

---

## 🎓 Learning Resources

- **Official Docs**: https://docs.pmnd.rs/zustand
- **GitHub**: https://github.com/pmndrs/zustand
- **Examples**: Check `/stores/examples.ts` for advanced patterns

---

## 🚀 Quick Start Checklist

1. ✅ Install Zustand: `npm install zustand`
2. ✅ Create a store in `/stores`
3. ✅ Import and use: `const { state, action } = useStore()`
4. ✅ Use selectors for optimal performance
5. ✅ Add middleware as needed (persist, devtools)

---

## 💡 Tips

- **DevTools**: Install Redux DevTools extension to debug Zustand stores
- **Persistence**: Use `persist` middleware for localStorage sync
- **Performance**: Select only what you need to minimize re-renders
- **Organization**: Keep stores focused on single concerns
- **Testing**: Zustand stores are easy to test - they're just functions!

---

**Happy coding! 🐻✨**
