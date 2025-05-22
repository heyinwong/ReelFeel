// src/utils/api.js
import axios from "axios";

// 创建带 token 的 axios 实例
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// 自动添加 Authorization 头
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
