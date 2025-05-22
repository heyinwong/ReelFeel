import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { motion } from "framer-motion";
function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      const url = isLogin ? "/login" : "/register";
      const res = await API.post(url, { username, password });

      if (isLogin) {
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("username", username);
        navigate("/");
      } else {
        setIsLogin(true); // auto switch to login
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with film reel bg */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center items-center justify-center"
        style={{
          backgroundImage: "url('/reel_wall.jpg')",
        }}
      >
        <div className="bg-black/80 text-white p-10 rounded-xl max-w-sm">
          <h2 className="text-2xl font-bold mb-3">
            🎬 Discover movies that feel like <em>you</em>
          </h2>
          <p className="text-sm leading-relaxed text-gray-200">
            Build your taste profile, track your journey, and let our AI
            recommend stories that speak to your soul.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] px-6">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-white shadow-xl border border-gray-300 rounded-xl px-8 py-10 w-full max-w-md"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-2 bg-black rounded" />

          <h2 className="text-2xl font-bold text-center mb-1">
            {isLogin ? "Log In to ReelFeel" : "Register an Account"}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            {isLogin
              ? "Welcome back — time for a new recommendation."
              : "Start tracking your movie moods today!"}
          </p>

          {errorMsg && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {errorMsg}
            </div>
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring focus:border-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring focus:border-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            {isLogin ? "Log In" : "Register"}
          </button>

          <div className="mt-4 text-sm text-center">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-500 hover:underline"
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
                  className="text-blue-500 hover:underline"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default LoginRegisterPage;
