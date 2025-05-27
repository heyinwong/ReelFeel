import { useNavigate, useLocation } from "react-router-dom";
import ReelButton from "./ReelButton";
import useAuth from "../hooks/useAuth";

function HeaderBar({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const getTagline = () => {
    switch (location.pathname) {
      case "/":
        return "Discover movies that feel like you";
      case "/watched":
        return "Your movie journey so far";
      case "/waiting":
        return "Your cinematic future awaits";
      case "/login":
        return "Sign in to start your reel adventure";
      default:
        return "Your detailed dashboard";
    }
  };

  return (
    <header
      className={`sticky top-0 bg-[#281B13]/75 border-b border-[#FC7023] text-white z-50 ${className}`}
    >
      <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-between px-6 py-5 gap-4">
        {/* Left: Logo + Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-left">
          <h1
            onClick={() => navigate("/")}
            className="text-2xl sm:text-3xl font-black tracking-widest text-[#FC7023] cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            ReelFeel
          </h1>
          <p className="text-sm sm:text-base text-white font-light italic fade-in-text pt-1 sm:pt-0 sm:ml-2">
            {getTagline()}
          </p>
        </div>

        {/* Right: Navigation Buttons */}
        <nav className="flex flex-wrap gap-2 items-center justify-center">
          <ReelButton onClick={() => navigate("/watched")}>Reel Log</ReelButton>
          <ReelButton onClick={() => navigate("/waiting")}>
            Watchlist
          </ReelButton>
          <ReelButton onClick={() => navigate("/dashboard")}>
            Dashboard
          </ReelButton>
          {user ? (
            <ReelButton onClick={logout}>Logout ({user.username})</ReelButton>
          ) : (
            <ReelButton onClick={() => navigate("/login")}>Login</ReelButton>
          )}
        </nav>
      </div>
    </header>
  );
}

export default HeaderBar;
