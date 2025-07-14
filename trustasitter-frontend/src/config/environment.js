// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "https://trustasitter-api-cwahftcwg4e5axah.australiaeast-01.azurewebsites.net/api",
  environment: import.meta.env.MODE || "development"
}; 