// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    API.get("/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.warn("Token invalid or expired.");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    navigate("/login");
  };

  return { user, isLoading, logout };
}
