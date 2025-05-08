import { useNavigate, useLocation } from "react-router-dom";
import ReelButton from "./ReelButton";

function HeaderBar({ username, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 动态 tagline 逻辑
  const getTagline = () => {
    switch (location.pathname) {
      case "/":
        return "Your mood-based movie companion";
      case "/watched":
        return "Your movie journey so far 🎬";
      case "/waiting":
        return "Your cinematic future awaits 🍿";
      case "/login":
        return "Sign in to start your reel adventure";
      default:
        return "Discover movies that feel like you";
    }
  };

  return (
    <header className="w-full bg-gradient-to-b from-black via-gray-800 to-gray-700 text-white shadow-md border-b border-gray-700">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between px-6 py-3 space-y-2 sm:space-y-0">
        {/* Left Section: Logo + Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-left">
          <h1
            onClick={() => navigate("/")}
            className="text-2xl sm:text-3xl font-extrabold tracking-wide cursor-pointer"
          >
            ReelFeel
          </h1>
          <p className="text-sm text-gray-300 font-light fade-in-text">
            {getTagline()}
          </p>
        </div>

        {/* Right Section: Navigation Buttons */}
        <nav className="flex gap-2 sm:gap-3 items-center">
          <ReelButton size="lg" onClick={() => navigate("/watched")}>
            📽️ Reel Log
          </ReelButton>
          <ReelButton size="lg" onClick={() => navigate("/waiting")}>
            🍿 Watchlist
          </ReelButton>
          {username ? (
            <ReelButton variant="ghost" size="lg" onClick={onLogout}>
              Logout ({username})
            </ReelButton>
          ) : (
            <ReelButton
              variant="ghost"
              size="lg"
              onClick={() => navigate("/login")}
            >
              Login
            </ReelButton>
          )}
        </nav>
      </div>
    </header>
  );
}

export default HeaderBar;
