import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { getCourses, deleteCourse } from '../services/course';
import { logout, getUserFromStorage } from '../services/auth';
import CourseCard from '../components/CourseCard';
import AddCourseModal from '../components/AddCourseModal';

const CourseDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [user, setUser] = useState<any>(null);

  // 获取课程列表
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const result = await getCourses();
      setCourses(result.data.courses);
    } catch (err: any) {
      setError('获取课程列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    
    // 获取用户信息
    const currentUser = getUserFromStorage();
    setUser(currentUser);
    
    // 移除所有播放器相关的事件监听器
    // 只保留课程获取逻辑
  }, []);

  // 处理添加/编辑课程成功
  const handleCourseSuccess = () => {
    fetchCourses();
    setEditingCourse(undefined);
  };

  // 处理编辑课程
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsAddModalOpen(true);
  };

  // 处理删除课程
  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('确定要删除这门课程吗？')) {
      try {
        await deleteCourse(courseId);
        fetchCourses();
      } catch (err) {
        console.error('删除课程失败:', err);
        alert('删除课程失败');
      }
    }
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('退出登录失败:', error);
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">B站视频课程管理系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  {user.avatar && (
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-8 h-8 rounded-full border"
                    />
                  )}
                  <span className="text-gray-600">
                    欢迎, {user.username || user.name || user.email || '用户'}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">我的B站视频课程</h2>
            <p className="text-gray-600 mt-1">支持B站视频直接播放，支持画中画、弹幕等功能</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-rose-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
            </svg>
            添加B站视频课程
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 text-pink-400 mx-auto mb-4">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无B站视频课程</h3>
            <p className="text-gray-600 mb-4">点击上方"添加B站视频课程"按钮开始添加您的第一个B站视频</p>
            <div className="bg-gray-50 p-4 rounded-lg text-left text-sm text-gray-700">
              <p className="font-medium mb-2">📌 支持的URL格式：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>完整URL：<code className="bg-gray-200 px-1">https://www.bilibili.com/video/BV1xxxxx/</code></li>
                <li>简写格式：<code className="bg-gray-200 px-1">BV1xxxxx</code></li>
                <li>带参数的URL：<code className="bg-gray-200 px-1">https://www.bilibili.com/video/BV1xxxxx/?spm_id_from=...</code></li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}
      </main>

      {/* 添加/编辑课程模态框 */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCourse(undefined);
        }}
        onSuccess={handleCourseSuccess}
        course={editingCourse}
      />
    </div>
  );
};

export default CourseDashboard;