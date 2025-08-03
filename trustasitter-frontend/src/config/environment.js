// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
      ? `${window.location.origin}/api` 
      : "http://20.58.138.202:3000/api"),
  environment: import.meta.env.MODE || "development"
}; 