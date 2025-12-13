import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  /* ----------------------------------
     Handle OAuth callback (?token=xxx)
  -----------------------------------*/
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("access_token", token);
      setIsAuthenticated(true);
    }
  }, []);

  /* --------------------
     Redirect after login
  ---------------------*/
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  /* --------------------
     Username / Password
  ---------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();
      // Log the response for debugging
      console.log("Auth response:", data);

      localStorage.setItem("access_token", data.access_token);
      setIsAuthenticated(true);
    } catch (err) {
      setError((err && typeof err === "object" && "message" in err) ? err.message : "Login failed");
      // Log the error for debugging
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------
     OAuth Login (Google)
  ---------------------*/
  const handleOAuthLogin = (provider) => {
    window.location.href = `${API_URL}/auth/token/${provider}`;
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left image */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="./login-bg.webp"
          alt="Login"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
      </div>

      {/* Right panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-xl space-y-6">

          <h1 className="text-3xl font-bold text-center">🌀 SuperMail</h1>

          <p className="text-center text-gray-400">
            Sign in to your account
          </p>

          {/* OAuth */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-grow h-px bg-white/20" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-grow h-px bg-white/20" />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 rounded-xl bg-black border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-black border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-600 transition font-medium disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <span
              className="text-blue-400 cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
