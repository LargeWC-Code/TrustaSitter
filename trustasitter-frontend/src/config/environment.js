// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
      ? "https://www.largewc.ink:443/api"  // Always use the correct backend in production
      : "https://www.largewc.ink:443/api"), // 默认使用 HTTPS
  environment: import.meta.env.MODE || "development"
}; 