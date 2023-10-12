import axios from "axios";

const ApiClient = axios.create({
  baseURL: process.env.REACT_APP_SERVER_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

ApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    /**
     * ...
     * handle errors in the request responses
     * ....
     */
    return Promise.reject(error);
  }
);

export default ApiClient;
