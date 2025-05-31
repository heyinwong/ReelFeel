import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import ReelButton from "./ReelButton";

function HeaderBar({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const getTagline = () => {
    switch (location.pathname) {
      case "/":
        return "Discover movies that feel like you";
      case "/watched":
        return "Your movie journey so far";
      case "/waiting":
        return "Your cinematic future awaits";
      case "/about":
        return "Where this story began, and why.";
      default:
        return "Your detailed dashboard";
    }
  };

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 bg-[#281B13] border-b border-[#FC7023] text-white z-50 ${className}`}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo + Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-center sm:text-left">
          <h1
            onClick={() => handleNav("/")}
            className="text-2xl sm:text-3xl font-black tracking-widest text-[#FC7023] cursor-pointer hover:scale-105 transition-transform"
          >
            ReelFeel
          </h1>
          <p className="text-xs sm:text-sm text-white font-light italic sm:mt-1 leading-tight">
            {getTagline()}
          </p>
        </div>

        {/* Right: Navigation Buttons (Desktop) */}
        <div className="hidden sm:flex flex-wrap gap-2 items-center">
          <ReelButton onClick={() => handleNav("/watched")}>
            Reel Log
          </ReelButton>
          <ReelButton onClick={() => handleNav("/waiting")}>
            Watchlist
          </ReelButton>
          <ReelButton onClick={() => handleNav("/dashboard")}>
            Dashboard
          </ReelButton>
          <ReelButton onClick={() => handleNav("/about")}>About</ReelButton>
          {user ? (
            <ReelButton onClick={logout}>Logout ({user.username})</ReelButton>
          ) : (
            <ReelButton onClick={() => handleNav("/login")}>Login</ReelButton>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="sm:hidden text-2xl text-[#FC7023]"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu (Dropdown List) */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col items-center gap-2 pb-4 animate-fade-in">
          <ReelButton onClick={() => handleNav("/watched")}>
            Reel Log
          </ReelButton>
          <ReelButton onClick={() => handleNav("/waiting")}>
            Watchlist
          </ReelButton>
          <ReelButton onClick={() => handleNav("/dashboard")}>
            Dashboard
          </ReelButton>
          <ReelButton onClick={() => handleNav("/about")}>About</ReelButton>
          {user ? (
            <ReelButton onClick={logout}>Logout ({user.username})</ReelButton>
          ) : (
            <ReelButton onClick={() => handleNav("/login")}>Login</ReelButton>
          )}
        </div>
      )}
    </header>
  );
}

export default HeaderBar;
