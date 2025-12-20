import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

/**
 * 🎓 ZUSTAND IN ACTION: Login Component
 * 
 * Notice how we replaced useState for auth with Zustand:
 * - No more prop drilling needed
 * - State persists across page refreshes
 * - Other components can access auth state easily
 */

const API_URL = "http://127.0.0.1:8000";

export default function Login() {
  // Local form state (still use useState for form inputs)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // ✨ ZUSTAND: Select only the state and actions we need
  const { 
    isAuthenticated, 
    login, 
    setLoading, 
    setError, 
    isLoading,
    error: authError 
  } = useAuthStore();

  const navigate = useNavigate();

  /* ----------------------------------
     Handle OAuth callback (?token=xxx)
  -----------------------------------*/
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // ✨ ZUSTAND: Use the login action instead of setIsAuthenticated
      login(token);
    }
  }, [login]);

  /* --------------------
     Redirect after login
  ---------------------*/
  useEffect(() => {
    if (isAuthenticated) {
      // Small delay to ensure state is persisted
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  /* --------------------
     Username / Password
  ---------------------*/
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ✨ ZUSTAND: Use the store actions
    setLoading(true);
    setError(null);

    try {
      // Prepare form data for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();
      console.log("Auth response:", data);

      // ✨ ZUSTAND: Use the login action to update global state
      login(data.access_token);
    } catch (err) {
      // ✨ ZUSTAND: Use the setError action
      const errorMessage = (err && typeof err === "object" && "message" in err) 
        ? (err as Error).message 
        : "Login failed";
      setError(errorMessage);
      console.error("Auth error:", err);
    } finally {
      // ✨ ZUSTAND: Update loading state
      setLoading(false);
    }
  };

  /* --------------------
     OAuth Login (Google)
  ---------------------*/
  const handleOAuthLogin = (provider: string) => {
    window.location.href = `${API_URL}/auth/token/${provider}`;
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left Panel - Video Preview */}
      <div className="hidden md:flex w-1/2 items-center justify-center p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Video Preview Card */}
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl aspect-[3/4] flex items-center justify-center overflow-hidden shadow-2xl">
            {/* Play Button */}
            <button className="w-20 h-20 bg-gray-600/80 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            
            {/* Optional: Video thumbnail overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
          </div>

          {/* Caption Text */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">
              Captions that Captivate
            </h2>
            <p className="text-gray-600 text-base">
              Join thousands of creators making their content stand out.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-black">
        <div className="w-full max-w-md space-y-6">

          <h1 className="text-3xl font-bold text-left text-gray-100">🔥 Caption Burn</h1>
          <h1 className="text-4xl font-extrabold text-left text-gray-100">Welcome Back</h1>

          <p className="text-left text-gray-200">
            Add stunning captions to your videos in minutes.
          </p>

          {/* OAuth */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-50 transition border border-gray-300"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-grow h-px bg-gray-500" />
            <span className="text-xs text-gray-300">OR</span>
            <div className="flex-grow h-px bg-gray-500" />
          </div>

          {/* Error - now using Zustand state */}
          {authError && (
            <p className="text-red-500 text-sm text-center">{authError}</p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 rounded-xl bg-[#15132c] border border-gray-800 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none text-gray-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-[#15132c] border border-gray-800 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none text-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#211e50] hover:bg-[#1a1845] transition font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-300">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline font-medium"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
