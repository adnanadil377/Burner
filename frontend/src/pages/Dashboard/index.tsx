import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { FileUpload } from '../../components/Dashboard/FileUpload';

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

        {/* File Upload Section */}
        <div className="bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--text-tertiary)]/20 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-['Outfit'] mb-2">
              🔥 Upload Your Files
            </h2>
            <p className="text-[var(--text-secondary)] font-['Outfit']">
              Experience the two-step upload process: Request → Direct Upload to Cloudflare R2
            </p>
          </div>
          
          <div className="flex justify-center">
            <FileUpload />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
