import axios from "axios";

// Create an Axios instance with the base URL from environment variables
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://trustasitter-api-cwahftcwg4e5axah.australiaeast-01.azurewebsites.net/api",
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Function to log in user
export const loginUser = async (email, password) => {
  const response = await api.post("/users/login", {
    email,
    password,
  });
  return response.data;
};

// Function to log in babysitter
export const loginBabysitter = async (email, password) => {
  const response = await api.post("/babysitters/login", {
    email,
    password,
  });
  return response.data;
};

// Universal login for users and babysitters
export const loginUniversal = async (email, password) => {
  const response = await api.post("/login", {
    email,
    password,
  });
  return response.data;
};

// Function to change babysitter password
export const changeBabysitterPassword = async (token, currentPassword, newPassword) => {
  const response = await api.put(
    "/babysitters/change-password",
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Function to update client profile
export const updateClientProfile = async (data, token) => {
  const response = await api.put("/users/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Function to delete client account
export const deleteClientAccount = async (token) => {
  const response = await api.delete("/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Function to register client
export const registerClient = async (data) => {
  const response = await api.post("/users/register", data);
  return response.data;
};

// Get bookings for a user
export const getUserBookings = async (userId, token) => {
  const response = await api.get(`/bookings/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Function to send email
export const sendEmail = async (emailData, token) => {
  const response = await api.post("/send-email", emailData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
