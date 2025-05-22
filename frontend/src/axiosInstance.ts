// src/axiosInstance.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://iayl4m0hxj.execute-api.us-east-2.amazonaws.com", // Your FastAPI base URL
});

export default api;
