import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:3000/api", // troca depois pelo seu domínio em produção
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
