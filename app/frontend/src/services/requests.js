import axios from 'axios';

const api = axios.create({
  // Set at build time on Vercel; local builds fall back to the Docker API.
  baseURL: process.env.REACT_APP_API_URL
    || `http://localhost:${process.env.REACT_APP_API_PORT || '3001'}`,
});

export const setToken = (token) => {
  api.defaults.headers.common.Authorization = token;
};

export const requestData = async (endpoint) => {
  const { data } = await api.get(endpoint);
  return data;
};

export const requestLogin = async (endpoint, body) => {
  const { data } = await api.post(endpoint, body);
  return data;
};

export default api;
