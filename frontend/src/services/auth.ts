import api from './api';
import { LoginResponse, RegisterResponse, User } from '../types';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', {
    email,
    password
  });
  return response.data;
};

export const register = async (formData: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', formData);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const saveUserToStorage = (user: User, token: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('解析用户数据失败:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
