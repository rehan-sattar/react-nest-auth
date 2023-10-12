import axios from "axios";

const ApiClient = axios.create({
  baseURL: process.env.REACT_APP_SERVER_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

ApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("Original request:: ", originalRequest);

      await ApiClient.post("/authentication/refresh-tokens");

      return axios(originalRequest);
    }

    return Promise.reject(error);
  }
);
export default ApiClient;
