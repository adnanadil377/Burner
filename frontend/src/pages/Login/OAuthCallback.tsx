import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This component handles the OAuth callback redirect from the backend
export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query params (e.g., token, error)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      // Store token (localStorage or cookie)
      localStorage.setItem("token", token);
      // Optionally: set user state, etc.
      navigate("/");
    } else if (error) {
      // Handle error (show message, etc.)
      alert("OAuth login failed: " + error);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-black">
      <div className="text-lg">Signing you in...</div>
    </div>
  );
}
