import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';

/**
 * 🎓 ZUSTAND IN ACTION: Dashboard Component
 * 
 * This demonstrates:
 * 1. Reading state from multiple stores
 * 2. Calling actions to update state
 * 3. How changes propagate automatically
 */

const Dashboard = () => {
  const navigate = useNavigate();
  
  // ✨ ZUSTAND: Get auth state and actions
  // Using selector pattern for optimal performance
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const logout = useAuthStore(state => state.logout);
  
  // ✨ ZUSTAND: Get UI state from a different store
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const openModal = useUIStore(state => state.openModal);

  const handleLogout = () => {
    logout(); // This clears auth state and localStorage
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with auth info */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🎉 Welcome to Your Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                You're successfully logged in!
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 
                         rounded-xl font-semibold transition-all hover:scale-105"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Auth Info Card */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🔐 Authentication Info
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Status:</span>
                <span className="ml-2 px-3 py-1 bg-green-600/20 border border-green-500/50 rounded-full text-green-400">
                  ✓ Authenticated
                </span>
              </div>
              <div>
                <span className="text-gray-400">Token:</span>
                <code className="ml-2 text-purple-400 break-all">
                  {token?.substring(0, 30)}...
                </code>
              </div>
              {user && (
                <>
                  <div>
                    <span className="text-gray-400">User ID:</span>
                    <span className="ml-2 text-blue-400">{user.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="ml-2 text-blue-400">{user.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* UI State Card (demonstrating multiple stores) */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🎨 UI Controls (Zustand Demo)
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Sidebar</span>
                <button
                  onClick={toggleSidebar}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    isSidebarOpen 
                      ? 'bg-green-600/20 border border-green-500/50 text-green-400' 
                      : 'bg-gray-600/20 border border-gray-500/50 text-gray-400'
                  }`}
                >
                  {isSidebarOpen ? '✓ Open' : '✗ Closed'}
                </button>
              </div>
              
              <button
                onClick={() => openModal('This is a modal from Zustand!')}
                className="w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 
                           border border-purple-500/50 rounded-lg font-medium transition"
              >
                🎭 Open Modal (Check Console)
              </button>
            </div>
          </div>
        </div>

        {/* Educational Card */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-lg 
                        border border-blue-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            🎓 Zustand is Now Managing Your State!
          </h2>
          <div className="space-y-3 text-gray-300">
            <p>✅ Auth state is global - accessible from any component</p>
            <p>✅ State persists across page refreshes</p>
            <p>✅ No prop drilling needed</p>
            <p>✅ Type-safe with TypeScript</p>
            <p>✅ Minimal boilerplate compared to Redux</p>
          </div>
          
          <div className="mt-6 p-4 bg-black/30 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">💡 Try this:</p>
            <ol className="text-sm space-y-1 text-gray-300 list-decimal list-inside">
              <li>Logout and login again - state persists!</li>
              <li>Open DevTools Console - see Zustand updates</li>
              <li>Check Application → Local Storage - see persisted state</li>
              <li>Toggle the sidebar button - instant UI state change</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
