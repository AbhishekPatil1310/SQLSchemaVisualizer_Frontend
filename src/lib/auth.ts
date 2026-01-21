import api from './api';

export const loginUser = async (credentials: any) => {
  const { data } = await api.post('/auth/login', credentials);
  return data; // Expected { token: "...", user: { id, email } }
};

export const registerUser = async (userData: any) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};