import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import ReelButton from "./ReelButton";

function HeaderBar({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const demoCode = import.meta.env.VITE_DEMO_ACCESS_CODE || "local-demo-code";
  const demoPath = `/demo?code=${encodeURIComponent(demoCode)}`;
  const navItems = [
    { path: "/watched", label: "Reel Log" },
    { path: "/waiting", label: "Watchlist" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/about", label: "About" },
  ];

  const getTagline = () => {
    switch (location.pathname) {
      case "/":
        return "Taste-aware film discovery";
      case "/watched":
        return "Logged films and reactions";
      case "/waiting":
        return "Titles saved for later";
      case "/about":
        return "Product context and build notes";
      default:
        return "Taste profile evidence";
    }
  };

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 bg-[#281B13] border-b border-[#FC7023] text-white z-50 ${className}`}
    >
      <div className="max-w-screen-xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Logo + Tagline */}
        <div className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:gap-4 text-center sm:text-left">
          <h1
            onClick={() => handleNav("/")}
            className="text-2xl sm:text-3xl font-black tracking-[0.18em] text-[#FC7023] cursor-pointer hover:scale-[1.02] transition-transform"
          >
            ReelFeel
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5 }}
              className="max-w-[220px] truncate text-xs sm:text-sm text-white/82 font-medium italic sm:mt-1 leading-tight sm:max-w-none sm:whitespace-nowrap"
            >
              {getTagline()}
            </motion.p>
          </AnimatePresence>
          {user?.is_demo && (
            <span className="mx-auto mt-2 w-fit rounded-xl border border-[#F3E2D4]/16 bg-[#F3E2D4]/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#F3E2D4]/72 sm:mx-0 sm:mt-0">
              Read-only demo
            </span>
          )}
        </div>

        {/* Right: Navigation Buttons (Desktop) */}
        <div className="hidden sm:flex flex-wrap gap-2 items-center justify-end">
          {navItems.map((item) => (
            <ReelButton
              key={item.path}
              active={isActive(item.path)}
              onClick={() => handleNav(item.path)}
            >
              {item.label}
            </ReelButton>
          ))}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[130px] truncate text-xs font-semibold text-[#F3E2D4]/65">
                {user.username}
              </span>
              <ReelButton onClick={() => logout("/")}>Logout</ReelButton>
            </div>
          ) : (
            <>
              <ReelButton onClick={() => handleNav(demoPath)} variant="solid">
                Try Demo
              </ReelButton>
              <ReelButton active={isActive("/login")} onClick={() => handleNav("/login")}>
                Login
              </ReelButton>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="sm:hidden text-2xl text-[#FC7023]"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu (Dropdown List) */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col items-stretch gap-2 px-6 pb-4 animate-fade-in">
          {navItems.map((item) => (
            <ReelButton
              key={item.path}
              active={isActive(item.path)}
              onClick={() => handleNav(item.path)}
              className="w-full"
            >
              {item.label}
            </ReelButton>
          ))}
          {user ? (
            <ReelButton onClick={() => logout("/")} className="w-full">
              Logout {user.username}
            </ReelButton>
          ) : (
            <>
              <ReelButton onClick={() => handleNav(demoPath)} variant="solid" className="w-full">
                Try Demo
              </ReelButton>
              <ReelButton active={isActive("/login")} onClick={() => handleNav("/login")} className="w-full">
                Login
              </ReelButton>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default HeaderBar;
