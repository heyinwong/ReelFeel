import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import useAuth from "../hooks/useAuth";

function DemoEntryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function enterDemo() {
      const code = searchParams.get("code") || "";
      if (!code) {
        setError("Missing demo access code.");
        return;
      }

      try {
        const res = await API.post("/demo-login", { code });
        await loginWithToken(res.data.access_token, "reelfeel_demo");
        if (!cancelled) navigate("/?demo=1", { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || "Demo access failed.");
        }
      }
    }

    enterDemo();
    return () => {
      cancelled = true;
    };
  }, [loginWithToken, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#281B13] text-[#F3E2D4] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <div className="text-[#FC7023] text-sm font-bold tracking-[0.25em] uppercase mb-4">
          ReelFeel Live Demo
        </div>
        <h1 className="text-3xl font-black mb-4">
          Opening the AI Taste Agent...
        </h1>
        {error ? (
          <>
            <p className="text-[#F3E2D4]/80 mb-6">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-[#FC7023] px-5 py-2.5 font-bold text-white"
            >
              Go to login
            </Link>
          </>
        ) : (
          <div className="mx-auto h-9 w-9 rounded-full border-4 border-[#FC7023]/30 border-t-[#FC7023] animate-spin" />
        )}
      </motion.div>
    </div>
  );
}

export default DemoEntryPage;
