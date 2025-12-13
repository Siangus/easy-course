import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { createCourse, updateCourse } from '../services/course';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course?: Course; // 如果提供，就是编辑模式
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  course 
}) => {
  const [formData, setFormData] = useState({
    courseName: '',
    courseUrl: '',
    description: '',
    loginUrl: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isZjoocCourse, setIsZjoocCourse] = useState(false);

  // 编辑模式下，填充表单数据
  useEffect(() => {
    if (course) {
      setFormData({
        courseName: course.courseName,
        courseUrl: course.courseUrl,
        description: course.description || '',
        loginUrl: course.loginUrl || '',
        username: '',
        password: ''
      });
      // 检查是否为ZJOOC课程
      setIsZjoocCourse(course.courseUrl.includes('www.zjooc.cn'));
    } else {
      setFormData({
        courseName: '',
        courseUrl: '',
        description: '',
        loginUrl: '',
        username: '',
        password: ''
      });
      setIsZjoocCourse(false);
    }
    setError(null);
  }, [course]);

  // 检测courseUrl变化，判断是否为ZJOOC课程
  useEffect(() => {
    setIsZjoocCourse(formData.courseUrl.includes('www.zjooc.cn'));
  }, [formData.courseUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (course) {
        await updateCourse(course.id, formData);
      } else {
        await createCourse(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {course ? '编辑课程' : '添加课程'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
              课程名称 *
            </label>
            <input
              type="text"
              id="courseName"
              placeholder="输入课程名称"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.courseName}
              onChange={(e) => setFormData({...formData, courseName: e.target.value})}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="courseUrl" className="block text-sm font-medium text-gray-700 mb-1">
              课程URL *
            </label>
            <div className="relative">
              <input
                type="url"
                id="courseUrl"
                placeholder="输入课程URL（例如：https://example.com/course）"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-24"
                value={formData.courseUrl}
                onChange={(e) => setFormData({...formData, courseUrl: e.target.value})}
                required
              />
              {isZjoocCourse && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  ZJOOC课程
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="loginUrl" className="block text-sm font-medium text-gray-700 mb-1">
              登录URL（可选，默认与课程URL相同）
            </label>
            <input
              type="url"
              id="loginUrl"
              placeholder="输入登录页面URL"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.loginUrl}
              onChange={(e) => setFormData({...formData, loginUrl: e.target.value})}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              课程描述（可选）
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="输入课程描述"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              登录用户名 *
            </label>
            <input
              type="text"
              id="username"
              placeholder="输入课程网站的登录用户名"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              登录密码 *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="输入课程网站的登录密码"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '隐藏' : '显示'}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '处理中...' : course ? '更新课程' : '添加课程'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;
