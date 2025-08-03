// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
      ? `${window.location.origin}/api` 
      : "https://largewc.org:3000/api"), // 默认使用 HTTPS
  environment: import.meta.env.MODE || "development"
}; 