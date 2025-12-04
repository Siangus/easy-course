import api from './api';
import { CourseListResponse, ProxyRedirectResponse } from '../types';

export const getCourses = async (page: number = 1, limit: number = 20): Promise<CourseListResponse> => {
  const response = await api.get<CourseListResponse>('/courses', {
    params: { page, limit }
  });
  return response.data;
};

export const createCourse = async (courseData: {
  courseName: string;
  courseUrl: string;
  description?: string;
  loginUrl?: string;
  username: string;
  password: string;
}): Promise<any> => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

export const updateCourse = async (courseId: string, courseData: {
  courseName?: string;
  description?: string;
  username?: string;
  password?: string;
}): Promise<any> => {
  const response = await api.put(`/courses/${courseId}`, courseData);
  return response.data;
};

export const deleteCourse = async (courseId: string): Promise<any> => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

export const getCourseById = async (courseId: string): Promise<any> => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export const launchCourse = async (courseId: string, action: 'direct' | 'embed' = 'direct'): Promise<ProxyRedirectResponse> => {
  const response = await api.post<ProxyRedirectResponse>('/proxy/redirect', {
    courseId,
    action
  });
  return response.data;
};

export const playVideo = async (courseId: string, videoUrl: string): Promise<string> => {
  // 生成代理视频URL
  const encodedVideoUrl = encodeURIComponent(videoUrl);
  return `${api.defaults.baseURL}/proxy/video/${courseId}?videoUrl=${encodedVideoUrl}`;
};
