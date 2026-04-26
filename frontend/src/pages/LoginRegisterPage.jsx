import { useState } from "react";
import { Eye, EyeOff, PlayCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";

function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const url = isLogin ? "/login" : "/register";
      const res = await API.post(url, { username, password });

      if (isLogin) {
        await loginWithToken(res.data.access_token, username);
        navigate(redirectTo);
      } else {
        setIsLogin(true);
        setErrorMsg("Account created. Log in to start building your taste profile.");
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = () => {
    const code = import.meta.env.VITE_DEMO_ACCESS_CODE || "local-demo-code";
    navigate(`/demo?code=${encodeURIComponent(code)}`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left visual panel */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center items-center justify-center"
        style={{
          backgroundImage: isLogin
            ? "url('/login.jpg')"
            : "url('/register.jpg')",
          backgroundPositionY: isLogin ? "center" : "20%",
        }}
      >
        <motion.div
          key={isLogin ? "login-quote" : "register-quote"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md px-8 text-center"
        >
          <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-[#FC7023]">
            ReelFeel
          </p>
          <p className="text-2xl font-semibold leading-tight text-white drop-shadow">
            {isLogin
              ? "Pick up where your taste memory left off."
              : "Build a profile from the films that stay with you."}
          </p>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#281B13] px-6 py-12 text-[#F3E2D4]">
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login-form" : "register-form"}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-md rounded-2xl border border-[#FC7023]/30 bg-[#F3E2D4] px-6 py-8 text-[#281B13] shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10"
          >
            <div className="absolute -top-2 left-1/2 h-2 w-20 -translate-x-1/2 rounded bg-[#FC7023]" />

            <h2 className="text-2xl font-bold text-center mb-1">
              {isLogin ? "Log In to ReelFeel" : "Create Your ReelFeel Account"}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              {isLogin
                ? "Welcome back. Your taste agent is ready for a new signal."
                : "Log films, rate reactions, and build a taste profile."}
            </p>

            {errorMsg && (
              <div className="text-[#8a3a14] bg-[#FC7023]/10 border border-[#FC7023]/30 rounded-md px-3 py-2 text-sm mb-4 text-center">
                {errorMsg}
              </div>
            )}

            <input
              type="text"
              placeholder="Username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-3 w-full rounded-lg border border-[#d8bd9f] bg-white px-4 py-2 text-[#281B13] focus:border-[#FC7023] focus:outline-none focus:ring-2 focus:ring-[#FC7023]/25"
            />
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#d8bd9f] bg-white px-4 py-2 pr-11 text-[#281B13] focus:border-[#FC7023] focus:outline-none focus:ring-2 focus:ring-[#FC7023]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#281B13] py-2 font-semibold text-[#F3E2D4] transition hover:bg-[#3a281d] disabled:opacity-60"
            >
              {isSubmitting ? "Working..." : isLogin ? "Log In" : "Register"}
            </button>

            <button
              type="button"
              onClick={handleDemoClick}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#FC7023] py-2 font-semibold text-[#281B13] transition hover:bg-[#FC7023]/10"
            >
              <PlayCircle size={18} />
              Try Live Demo
            </button>

            <div className="mt-4 text-sm text-center">
              {isLogin ? (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="font-semibold text-[#C84E14] hover:underline"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="font-semibold text-[#C84E14] hover:underline"
                  >
                    Log In
                  </button>
                </>
              )}
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LoginRegisterPage;
