import axios from "axios";
//this file help with apis
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true
});

export default axiosInstance;
