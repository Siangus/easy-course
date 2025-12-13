import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { launchCourse } from '../services/course';

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
    setIsLoading(true);
    try {
      const result = await launchCourse(course.id);
      window.open(result.data.redirectUrl, '_blank');
    } catch (error) {
      console.error('启动课程失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 提取B站视频ID
  const extractBvid = () => {
    const url = course.courseUrl || '';
    
    // 从完整URL提取
    if (url.includes('bilibili.com/video/')) {
      const matches = url.match(/video\/(BV[\w]+)/);
      if (matches && matches[1]) {
        return matches[1];
      }
    }
    
    // 从其他格式提取
    const bvMatch = url.match(/(BV[\w]+)/);
    if (bvMatch) {
      return bvMatch[1];
    }
    
    // 直接输入的是BV号
    if (url.startsWith('BV')) {
      return url;
    }
    
    return null;
  };

  // 跳转到B站视频播放页面
  const handlePlayBilibiliVideo = () => {
    const bvid = extractBvid();
    if (bvid) {
      // 跳转到专门的B站视频播放页面
      navigate(`/bilibili-player/${bvid}`, {
        state: { courseName: course.courseName }
      });
    } else {
      alert('无法识别B站视频链接，请确认URL格式正确');
    }
  };

  // 检查是否为B站视频
  const isBilibiliVideo = () => {
    const url = course.courseUrl || '';
    return url.includes('bilibili.com') || url.includes('BV') || url.startsWith('BV');
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
          
          {/* B站视频标识 */}
          {isBilibiliVideo() && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 border border-pink-200">
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
                </svg>
                B站视频
              </span>
            </div>
          )}
          
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
            title="更多操作"
          >
            ⋮
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <button
                onClick={() => {
                  onEdit(course);
                  setShowActions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ✏️ 编辑课程
              </button>
              <button
                onClick={handlePlayBilibiliVideo}
                className="block w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-gray-100 transition-colors"
              >
                ▶️ 播放B站视频
              </button>
              <div className="border-t"></div>
              <button
                onClick={() => {
                  onDelete(course.id);
                  setShowActions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                🗑️ 删除课程
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleLaunch}
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              加载中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              跳转到课程网站
            </>
          )}
        </button>
        
        <button
          onClick={handlePlayBilibiliVideo}
          disabled={!isBilibiliVideo()}
          className={`ml-3 py-3 px-6 rounded-lg transition-all flex items-center justify-center ${
            isBilibiliVideo() 
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 transform hover:scale-105' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={isBilibiliVideo() ? "在播放页面观看B站视频" : "此课程不是B站视频"}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
          </svg>
          {isBilibiliVideo() ? '观看B站视频' : '非B站视频'}
        </button>
      </div>
      
      {/* 视频信息 */}
      {isBilibiliVideo() && extractBvid() && (
        <div className="mt-3 p-2 bg-gray-50 rounded border text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">视频ID:</span>
            <code className="bg-gray-100 px-2 py-1 rounded font-mono">{extractBvid()}</code>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;