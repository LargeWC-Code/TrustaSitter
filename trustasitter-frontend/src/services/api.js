import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:3000/api", // Base URL for the API
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
