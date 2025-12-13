import React, { useState } from 'react';
import { Course } from '../types';
import { launchCourse } from '../services/course';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const handleLaunch = async () => {
    // 检测是否为ZJOOC课程
    if (course.courseUrl.includes('www.zjooc.cn')) {
      // ZJOOC课程跳转到独立页面
      window.open(`/zjooc/course/${course.id}`, '_blank');
    } else {
      // 非ZJOOC课程执行原有逻辑
      setIsLoading(true);
      try {
        const result = await launchCourse(course.id);
        // 在新标签页打开
        window.open(result.data.redirectUrl, '_blank');
      } catch (error) {
        console.error('启动课程失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePlayVideo = async () => {
    try {
      // 这里应该调用获取视频URL的API，为了简化，我们直接模拟一个事件
      window.dispatchEvent(new CustomEvent('openVideoPlayer', {
        detail: { videoUrl: '', courseName: course.courseName }
      }));
    } catch (error) {
      console.error('播放视频失败:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {course.courseName}
          </h3>
          <p className="text-gray-600 mt-2 text-sm line-clamp-2">
            {course.description || '暂无描述'}
          </p>
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <span>访问次数: {course.accessCount}</span>
            <span className="mx-2">•</span>
            <span>
              最后访问: {course.lastAccessed ? 
              new Date(course.lastAccessed).toLocaleDateString() : '从未'}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            ⋮
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit(course);
                  setShowActions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => {
                  onDelete(course.id);
                  setShowActions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleLaunch}
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '加载中...' : '进入课程'}
        </button>
        
        <button
          onClick={handlePlayVideo}
          className="ml-3 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
        >
          画中画播放
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
