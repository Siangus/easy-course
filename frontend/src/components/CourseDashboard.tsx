import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { getCourses, deleteCourse } from '../services/course';
import { logout, getUserFromStorage } from '../services/auth';
import CourseCard from './CourseCard';
import AddCourseModal from './AddCourseModal';
import VideoPlayer from './VideoPlayer';

const CourseDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [videoInfo, setVideoInfo] = useState({ videoUrl: '', courseName: '' });
  const [user] = useState(getUserFromStorage());

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
    
    // 监听视频播放器事件
    const handleOpenVideoPlayer = (event: CustomEvent) => {
      setVideoInfo({
        videoUrl: event.detail.videoUrl,
        courseName: event.detail.courseName
      });
      setIsVideoPlayerOpen(true);
    };
    
    window.addEventListener('openVideoPlayer', handleOpenVideoPlayer as EventListener);
    
    return () => {
      window.removeEventListener('openVideoPlayer', handleOpenVideoPlayer as EventListener);
    };
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
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">课程一键跳转系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-gray-600">欢迎, {user.username}</span>
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
          <h2 className="text-3xl font-bold text-gray-800">我的课程</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加课程
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无课程</h3>
            <p className="text-gray-600 mb-4">点击上方"添加课程"按钮开始添加您的第一门课程</p>
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

      {/* 视频播放器 */}
      {isVideoPlayerOpen && (
        <VideoPlayer
          videoUrl={videoInfo.videoUrl}
          courseName={videoInfo.courseName}
          onClose={() => setIsVideoPlayerOpen(false)}
        />
      )}
    </div>
  );
};

export default CourseDashboard;
