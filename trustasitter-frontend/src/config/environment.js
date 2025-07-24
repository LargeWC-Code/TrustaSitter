// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  environment: import.meta.env.MODE || "development"
}; 