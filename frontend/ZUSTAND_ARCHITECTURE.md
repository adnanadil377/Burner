# Zustand State Flow in Your App

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your React App                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Landing    │      │    Login     │      │  Dashboard   │  │
│  │    Page      │      │     Page     │      │     Page     │  │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘  │
│         │                     │                      │           │
│         │                     │                      │           │
│         └─────────────────────┼──────────────────────┘           │
│                               │                                  │
│                               ▼                                  │
│                    ┌──────────────────────┐                      │
│                    │  Zustand Stores      │                      │
│                    ├──────────────────────┤                      │
│                    │                      │                      │
│                    │  useAuthStore        │◄─────┐               │
│                    │  ├─ user             │      │               │
│                    │  ├─ token            │      │               │
│                    │  ├─ isAuthenticated  │      │               │
│                    │  ├─ login()          │      │               │
│                    │  └─ logout()         │      │               │
│                    │                      │      │               │
│                    │  useUIStore          │      │               │
│                    │  ├─ sidebar          │      │               │
│                    │  ├─ modal            │      │               │
│                    │  └─ theme            │      │               │
│                    └──────────┬───────────┘      │               │
│                               │                  │               │
└───────────────────────────────┼──────────────────┼───────────────┘
                                │                  │
                                ▼                  │
                    ┌───────────────────────┐      │
                    │   localStorage        │      │
                    ├───────────────────────┤      │
                    │  auth-storage: {      │      │
                    │    token: "...",      │      │
                    │    isAuthenticated    │──────┘
                    │  }                    │ (persists)
                    └───────────────────────┘
```

## Data Flow Example: Login Process

```
User enters credentials
        │
        ▼
┌────────────────────────────┐
│  Login Component           │
│  - handleSubmit()          │
│  - fetch('/api/login')     │
└────────┬───────────────────┘
         │
         │ API call successful
         ▼
┌────────────────────────────┐
│  useAuthStore.login()      │
│  - set({ token, user })    │
│  - set({ isAuthenticated })│
└────────┬───────────────────┘
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌─────────────────────┐    ┌──────────────────┐
│  localStorage       │    │  All Components  │
│  token saved        │    │  auto re-render  │
└─────────────────────┘    └──────────────────┘
                                    │
                                    ▼
                           ┌────────────────────┐
                           │  PrivateRoute      │
                           │  redirects to      │
                           │  /dashboard        │
                           └────────────────────┘
```

## Component Usage Pattern

```tsx
// 🎯 Pattern 1: Single Selector
const Login = () => {
  const login = useAuthStore(state => state.login);
  // Component only re-renders when login function changes (never)
}

// 🎯 Pattern 2: Multiple Selectors
const Dashboard = () => {
  const { user, token, logout } = useAuthStore(state => ({
    user: state.user,
    token: state.token,
    logout: state.logout,
  }));
  // Component only re-renders when user, token, or logout changes
}

// 🎯 Pattern 3: Computed Values
const UserStatus = () => {
  const isAdmin = useAuthStore(state => 
    state.user?.role === 'admin'
  );
  // Component only re-renders when computed value changes
}
```

## Store Organization

```
src/stores/
│
├── useAuthStore.ts          ← Authentication
│   ├── State: user, token, isAuthenticated
│   ├── Actions: login(), logout()
│   └── Middleware: persist (localStorage)
│
├── useUIStore.ts            ← UI State
│   ├── State: sidebar, modal, theme
│   └── Actions: toggle functions
│
└── examples.ts              ← Learning Examples
    ├── Todo store
    ├── Async patterns
    └── Advanced middleware
```

## Middleware Stack

```
create()
  └─ persist()              ← Saves to localStorage
      └─ devtools()         ← Redux DevTools integration
          └─ your store     ← Your state and actions

Flow:
Action called → devtools logs it → persist saves it → state updates → components re-render
```

## Performance Optimization

```
❌ BAD - Re-renders on ANY state change
const store = useAuthStore();

✅ GOOD - Only re-renders when 'user' changes
const user = useAuthStore(state => state.user);

✅ BETTER - Multiple specific values
const { user, logout } = useAuthStore(state => ({
  user: state.user,
  logout: state.logout,
}));

🚀 BEST - With shallow comparison
import { shallow } from 'zustand/shallow';
const { user, logout } = useAuthStore(
  state => ({ user: state.user, logout: state.logout }),
  shallow
);
```

## Real-World Usage in Your App

### 1. Login Flow
```
pages/Login/index.tsx
  ├─ Calls: login(token, user)
  ├─ Reads: isAuthenticated, error
  └─ Navigates to /dashboard on success
```

### 2. Dashboard
```
pages/Dashboard/index.tsx
  ├─ Reads: user, token, isAuthenticated
  ├─ Displays: user info, auth status
  └─ Calls: logout() on button click
```

### 3. Route Protection
```
routes/AppRoutes.tsx
  ├─ Reads: isAuthenticated
  └─ Redirects: to /login if not authenticated
```

### 4. Persistence
```
On page load:
  1. Zustand checks localStorage
  2. Restores 'auth-storage' data
  3. Sets isAuthenticated if token exists
  4. App knows user is logged in
```

## State Updates Timeline

```
Time: 0ms
├─ User clicks login
│
Time: 10ms
├─ handleSubmit() called
├─ setLoading(true) → Store updates → UI shows "Loading..."
│
Time: 300ms (API responds)
├─ login(token, user) called
├─ Store updates:
│   ├─ token = "abc123"
│   ├─ user = { id: 1, email: "..." }
│   ├─ isAuthenticated = true
│   └─ isLoading = false
│
Time: 301ms
├─ localStorage.setItem('access_token', 'abc123')
├─ All subscribed components re-render:
│   ├─ Login page: sees isAuthenticated, navigates away
│   ├─ PrivateRoute: allows access to /dashboard
│   └─ Dashboard: displays user info
│
Time: 350ms
└─ Navigation complete, user sees dashboard
```

## Debugging Your Stores

### 1. Console Logging
```tsx
// Log all state changes
useAuthStore.subscribe(console.log);

// Log specific changes
useAuthStore.subscribe(
  state => state.user,
  (user, prevUser) => console.log('User changed from', prevUser, 'to', user)
);
```

### 2. Redux DevTools
```
1. Install Redux DevTools extension
2. Open DevTools → Redux tab
3. See action history:
   - @@INIT
   - login
   - setUser
   - logout
4. Time-travel through state changes!
```

### 3. Imperative Access
```tsx
// Get current state anytime
console.log('Current auth:', useAuthStore.getState());

// Set state from anywhere
useAuthStore.setState({ isLoading: true });
```

---

This visual guide shows how Zustand powers your entire app's state management! 🎨✨
