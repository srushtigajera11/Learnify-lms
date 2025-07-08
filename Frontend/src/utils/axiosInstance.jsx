// utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // Replace with your backend URL if deployed
  withCredentials: true,               // ✅ Enables cookie sending
});

export default axiosInstance;

