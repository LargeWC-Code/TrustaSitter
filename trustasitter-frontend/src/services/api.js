import axios from "axios";

// Create an axios instance with dynamic baseURL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Base URL for the API
});

// Function to log in user
export const loginUser = async (email, password) => {
  const response = await api.post("/users/login", {
    email,
    password,
  });
  return response.data; // contains { message, token, user }
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
  return response.data; // contains { message, token, role, user }
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
