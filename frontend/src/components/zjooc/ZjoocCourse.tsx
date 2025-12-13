import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '../../types';
import { getCourseById } from '../../services/course';

const ZjoocCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('课程ID不存在');
      setIsLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const result = await getCourseById(id);
        setCourse(result.data);
        // 验证是否为ZJOOC课程
        if (!result.data.courseUrl.includes('www.zjooc.cn')) {
          setError('该课程不是ZJOOC课程');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || '获取课程信息失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleLaunch = () => {
    if (course) {
      // 这里可以添加ZJOOC课程的特殊处理逻辑
      window.open(course.courseUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-red-600 text-lg mb-4">{error || '课程不存在'}</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          返回课程列表
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{course.courseName}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">ZJOOC课程</span>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">课程信息</h2>
            <button
              onClick={handleBack}
              className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">课程URL</p>
              <p className="text-gray-800 break-all">{course.courseUrl}</p>
            </div>
            {course.loginUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-1">登录URL</p>
                <p className="text-gray-800 break-all">{course.loginUrl}</p>
              </div>
            )}
            {course.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">课程描述</p>
                <p className="text-gray-800">{course.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">创建时间</p>
              <p className="text-gray-800">{new Date(course.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">访问次数</p>
              <p className="text-gray-800">{course.accessCount}</p>
            </div>
            {course.lastAccessed && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">最后访问</p>
                <p className="text-gray-800">{new Date(course.lastAccessed).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handleLaunch}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            进入ZJOOC课程
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZjoocCourse;