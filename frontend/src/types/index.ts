// 课程类型
export interface Course {
  id: string;
  courseName: string;
  courseUrl: string;
  loginUrl?: string;
  description?: string;
  lastAccessed?: string;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
  bvid?: string;
  aid?: string;
  cid?: string;
  episodeId?: string;
  seasonId?: string;
}

// 用户类型
export interface User {
  id: string;
  email: string;
  username: string;
}

// 登录响应类型
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    sessionToken: string;
    user: User;
    expiresIn: number;
  };
}

// 注册响应类型
export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    username: string;
  };
}

// 课程列表响应类型
export interface CourseListResponse {
  success: boolean;
  data: {
    courses: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 代理跳转响应类型
export interface ProxyRedirectResponse {
  success: boolean;
  data: {
    redirectUrl: string;
    embeddedUrl: string;
  };
}
