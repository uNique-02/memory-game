import axios from "axios";

const apiClient = axios.create({
  baseURL:
    import.meta.mode === "development" ? "http://localhost:5000/api" : "/api",
  withCredentials: true, //send cookies with requests
});

export default apiClient;
