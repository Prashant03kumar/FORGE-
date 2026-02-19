// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1", // Note the /api/v1 prefix
  withCredentials: true, // This is mandatory for your JWT cookies
});

export default api;
