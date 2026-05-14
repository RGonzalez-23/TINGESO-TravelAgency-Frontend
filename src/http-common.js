import axios from "axios";
import keycloak from "./services/keycloak";

const apiHost = import.meta.env.VITE_TRAVEL_BACKEND_SERVER;
const apiPort = import.meta.env.VITE_TRAVEL_BACKEND_PORT;

// Production (Docker with Nginx), we  use relative routes for the proxy.
// If local development (Vite), we use the .env variables.
const api = axios.create({
  baseURL: (apiHost && apiPort) ? `http://${apiHost}:${apiPort}` : "",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30);
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;