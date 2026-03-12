import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url as string | undefined;
    const isLoginRequest = requestUrl?.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default api;
