import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const AuthContext = createContext(null);

const AUTH_CHANGE_EVENT = "reelfeel-auth-change";
const AUTH_CHECK_TIMEOUT_MS = 8000;

function getStoredToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()));
  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      AUTH_CHECK_TIMEOUT_MS
    );

    try {
      const res = await API.get("/me", { signal: controller.signal });
      setUser(res.data);
      return res.data;
    } catch {
      console.warn("Token invalid or expired.");
      clearSession();
      return null;
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => refreshUser();
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refreshUser]);

  const loginWithToken = useCallback(
    async (token, username = "") => {
      localStorage.setItem("token", token);
      if (username) localStorage.setItem("username", username);
      notifyAuthChange();
      return await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(
    (redirectTo = "/") => {
      clearSession();
      notifyAuthChange();
      navigate(redirectTo);
    },
    [clearSession, navigate]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isDemo: Boolean(user?.is_demo),
      loginWithToken,
      logout,
      refreshUser,
    }),
    [isLoading, loginWithToken, logout, refreshUser, user]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
