/**
 * 🎓 ZUSTAND CHEAT SHEET COMPONENT
 * 
 * This component demonstrates all common Zustand patterns in one place.
 * Use this as a quick reference!
 */

import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';

export default function ZustandCheatSheet() {
  // ============================================
  // 📖 PATTERN 1: Basic Usage
  // ============================================
  
  // Get a single value
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  // Get a single action
  const login = useAuthStore(state => state.login);
  
  
  // ============================================
  // 📖 PATTERN 2: Multiple Values (Optimized)
  // ============================================
  
  // Select multiple values - component only re-renders when THESE change
  const { user, token, logout } = useAuthStore(state => ({
    user: state.user,
    token: state.token,
    logout: state.logout,
  }));
  
  
  // ============================================
  // 📖 PATTERN 3: Using Multiple Stores
  // ============================================
  
  // Get state from different stores
  const theme = useUIStore(state => state.theme);
  const toggleTheme = useUIStore(state => state.toggleTheme);
  
  
  // ============================================
  // 📖 PATTERN 4: Derived/Computed Values
  // ============================================
  
  // Calculate values based on state
  const isAdmin = useAuthStore(state => 
    state.user?.email?.includes('admin') || false
  );
  
  const userDisplayName = useAuthStore(state => 
    state.user?.username || 'Guest'
  );
  
  
  // ============================================
  // 📖 PATTERN 5: Imperative Actions
  // ============================================
  
  const handleSomething = () => {
    // Get current state without subscribing
    const currentUser = useAuthStore.getState().user;
    console.log('Current user:', currentUser);
    
    // Set state imperatively (outside the hook)
    useAuthStore.setState({ isLoading: true });
    
    // Call actions
    useAuthStore.getState().setError('Something went wrong');
  };
  
  
  // ============================================
  // 📖 PATTERN 6: Async Operations
  // ============================================
  
  const handleAsyncLogin = async () => {
    const { setLoading, setError, login } = useAuthStore.getState();
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/login');
      const data = await response.json();
      login(data.token, data.user);
    } catch (error) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  
  // ============================================
  // 📖 PATTERN 7: Conditional Rendering
  // ============================================
  
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8">🐻 Zustand Cheat Sheet</h1>
      
      {/* Pattern 1: Basic Usage */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">1️⃣ Basic Usage</h2>
        <p>Auth Status: {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}</p>
        <button 
          onClick={() => login('demo-token')}
          className="mt-2 px-4 py-2 bg-blue-600 rounded"
        >
          Login (Demo)
        </button>
      </section>
      
      {/* Pattern 2: Multiple Values */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">2️⃣ Multiple Values</h2>
        <p>User: {user?.username || 'None'}</p>
        <p>Token: {token ? `${token.substring(0, 20)}...` : 'None'}</p>
        <button 
          onClick={logout}
          className="mt-2 px-4 py-2 bg-red-600 rounded"
        >
          Logout
        </button>
      </section>
      
      {/* Pattern 3: Multiple Stores */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">3️⃣ Multiple Stores</h2>
        <p>Current Theme: {theme}</p>
        <button 
          onClick={toggleTheme}
          className="mt-2 px-4 py-2 bg-purple-600 rounded"
        >
          Toggle Theme
        </button>
      </section>
      
      {/* Pattern 4: Computed Values */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">4️⃣ Computed Values</h2>
        <p>Display Name: {userDisplayName}</p>
        <p>Is Admin: {isAdmin ? '👑 Yes' : '👤 No'}</p>
      </section>
      
      {/* Pattern 5: Imperative Actions */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">5️⃣ Imperative Actions</h2>
        <button 
          onClick={handleSomething}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Trigger Imperative Action (Check Console)
        </button>
      </section>
      
      {/* Pattern 6: Async Operations */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">6️⃣ Async Operations</h2>
        <button 
          onClick={handleAsyncLogin}
          className="px-4 py-2 bg-yellow-600 rounded"
        >
          Async Login (Demo)
        </button>
      </section>
      
      {/* Code Examples */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">📝 Code Examples</h2>
        <pre className="bg-black p-4 rounded overflow-x-auto text-sm">
{`// Select single value
const user = useAuthStore(state => state.user);

// Select multiple values (optimized)
const { user, logout } = useAuthStore(state => ({
  user: state.user,
  logout: state.logout,
}));

// Computed values
const isAdmin = useAuthStore(state => 
  state.user?.role === 'admin'
);

// Imperative access
const user = useAuthStore.getState().user;
useAuthStore.setState({ isLoading: true });`}
        </pre>
      </section>
    </div>
  );
}

/**
 * 🎓 QUICK TIPS
 * 
 * 1. Always use selectors to pick specific state
 * 2. Actions don't cause re-renders (functions are stable)
 * 3. Use getState() for imperative access
 * 4. Use setState() to update state imperatively
 * 5. Combine multiple stores for separation of concerns
 * 6. Keep computed values as selectors, not stored state
 */
