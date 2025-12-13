// page/BilibiliPlayerPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getUserFromStorage, logout } from '../services/auth';

const BilibiliPlayerPage: React.FC = () => {
  const { bvid } = useParams<{ bvid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [playerOptions, setPlayerOptions] = useState({
    autoplay: true,
    p: 1,
    width: 900,
    height: 506
  });
  
  const [user, setUser] = useState<any>(null);
  const [courseName, setCourseName] = useState('B站视频');

  // 初始化
  useEffect(() => {
    const currentUser = getUserFromStorage();
    setUser(currentUser);
    
    if (location.state?.courseName) {
      setCourseName(location.state.courseName);
    }
    
    if (!bvid) {
      navigate('/dashboard');
    }
  }, [bvid, navigate, location.state]);

  // 构建B站播放器URL
  const buildBilibiliUrl = () => {
    if (!bvid) return '';
    
    const baseUrl = 'https://player.bilibili.com/player.html';
    const params = new URLSearchParams({
      bvid: bvid,
      autoplay: playerOptions.autoplay ? '1' : '0',
      p: playerOptions.p.toString()
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  // 调整播放器大小
  const handleResize = (delta: number) => {
    const newWidth = Math.max(400, Math.min(1200, playerOptions.width + delta));
    const newHeight = newWidth * (9 / 16);
    setPlayerOptions(prev => ({ ...prev, width: newWidth, height: newHeight }));
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
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>返回课程列表</span>
              </button>
              <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
                </svg>
                <span className="font-medium text-blue-600">B站视频播放器</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-gray-600">
                  欢迎, {user.username || user.name || user.email || '用户'}
                </span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标题区域 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{courseName}</h1>
          <div className="flex items-center space-x-4">
            <div className="text-gray-600">
              视频ID: <code className="ml-2 bg-gray-200 px-2 py-1 rounded font-mono">{bvid}</code>
            </div>
            <button
              onClick={() => window.open(`https://www.bilibili.com/video/${bvid}`, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>在B站打开</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          {/* 播放器控制栏 */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPlayerOptions(prev => ({ ...prev, p: Math.max(1, prev.p - 1) }))}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center space-x-1"
                  disabled={playerOptions.p <= 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>上一个P</span>
                </button>
                <div className="px-3 py-1 bg-gray-100 rounded">
                  <span className="font-medium">当前: P{playerOptions.p}</span>
                </div>
                <button
                  onClick={() => setPlayerOptions(prev => ({ ...prev, p: prev.p + 1 }))}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center space-x-1"
                >
                  <span>下一个P</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleResize(-100)}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                disabled={playerOptions.width <= 400}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm text-gray-600">
                尺寸: {playerOptions.width}×{Math.round(playerOptions.height)}
              </span>
              <button
                onClick={() => handleResize(100)}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                disabled={playerOptions.width >= 1200}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setPlayerOptions({
                    autoplay: true,
                    p: 1,
                    width: 900,
                    height: 506
                  });
                }}
                className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded ml-2"
              >
                重置大小
              </button>
            </div>
          </div>

          {/* B站播放器 */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{
            width: playerOptions.width,
            height: playerOptions.height
          }}>
            <iframe
              src={buildBilibiliUrl()}
              className="absolute inset-0 w-full h-full border-0"
              scrolling="no"
              frameBorder="no"
              frameSpacing="0"
              allowFullScreen
              title="B站视频播放器"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BilibiliPlayerPage;