import axios from "axios";
import keycloak from "./services/keycloak";

const travelBackendServer = import.meta.env.VITE_TRAVEL_BACKEND_SERVER;
const travelBackendPort = import.meta.env.VITE_TRAVEL_BACKEND_PORT;

console.log(travelBackendServer)
console.log(travelBackendPort)

const api = axios.create({
  baseURL: `http://${travelBackendServer}:${travelBackendPort}`,
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