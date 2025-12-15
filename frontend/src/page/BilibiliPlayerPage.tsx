// page/BilibiliPlayerPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getUserFromStorage, logout } from '../services/auth';

// BibiGPT API响应类型
interface BibiGPTResponse {
  success: boolean;
  id: string;
  service: string;
  sourceUrl: string;
  htmlUrl: string;
  costDuration: number;
  remainingTime: number;
  summary: string;
  detail: {
    summary: string;
    dbId: string;
    id: string;
    embedId: string;
    pageId: string;
    url: string;
    rawLang: string;
    audioUrl: string;
    playUrl: string;
    type: string;
    title: string;
    cover: string;
    author: string;
    authorId: string;
    duration: number;
    subtitlesArray: Array<{
      startTime: number;
      end: number;
      text: string;
      index: number;
      speaker_id: number;
    }>;
    descriptionText: string;
    contentText: string;
    chapters: Array<{}>;
    local_path: string;
  };
}

const BilibiliPlayerPage: React.FC = () => {
  const { bvid } = useParams<{ bvid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [playerOptions, setPlayerOptions] = useState({
    autoplay: true,
    muted: false,
    danmaku: true,
    t: 0,
    p: 1,
    width: 800,
    height: 450
  });
  
  const [user, setUser] = useState<any>(null);
  const [courseName, setCourseName] = useState('B站视频');
  
  // 视频总结相关状态
  const [videoSummary, setVideoSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string>('');

  // 从路由state中获取课程名称
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

  // 组件挂载时获取视频总结
  useEffect(() => {
    fetchVideoSummary();
  }, [bvid]);

  // 构建B站播放器URL
  const buildBilibiliUrl = () => {
    if (!bvid) return '';
    
    const baseUrl = 'https://player.bilibili.com/player.html';
    const params = new URLSearchParams({
      bvid: bvid,
      autoplay: playerOptions.autoplay ? '1' : '0',
      muted: playerOptions.muted ? '1' : '0',
      danmaku: playerOptions.danmaku ? '1' : '0',
      t: playerOptions.t.toString(),
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

  // 跳转到指定时间
  const handleJumpToTime = () => {
    const time = prompt('请输入要跳转的时间（秒）:', playerOptions.t.toString());
    if (time !== null) {
      const seconds = parseInt(time) || 0;
      setPlayerOptions(prev => ({ ...prev, t: Math.max(0, seconds) }));
    }
  };

  // 获取视频总结的函数
  const fetchVideoSummary = async () => {
    if (!bvid) return;
    
    setIsLoadingSummary(true);
    setSummaryError('');
    
    try {
      // 构建B站视频URL
      const videoUrl = `https://www.bilibili.com/video/${bvid}`;
      
      // 调用BibiGPT API - 使用占位API key
      const apiKey = 'aroZX30hEzg3'; // 这里需要替换为实际的API key
      const response = await fetch('https://api.bibigpt.co/api/v1/summarizeWithConfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: videoUrl,
          includeDetail: true,
          promptConfig: {
            showEmoji: true,
            showTimestamp: true,
            outlineLevel: 1,
            sentenceNumber: 5,
            detailLevel: 700,
            outputLanguage: "zh-CN"
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.statusText}`);
      }
      
      const data: BibiGPTResponse = await response.json();
      
      if (data.success) {
        setVideoSummary(data.summary);
      } else {
        throw new Error('获取视频总结失败');
      }
      
    } catch (error) {
      console.error('获取视频总结时出错:', error);
      setSummaryError('获取视频总结失败，请稍后重试');
    } finally {
      setIsLoadingSummary(false);
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

  // 解析时间戳为秒数
  const parseTimestamp = (timestamp: string): number => {
    const match = timestamp.match(/\[(\d+)(?::(\d+))?(?::(\d+))?\]/);
    if (!match) return 0;
    
    const parts = match.slice(1).filter(Boolean).map(Number);
    
    if (parts.length === 3) {
      // [时:分:秒]
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // [分:秒]
      return parts[0] * 60 + parts[1];
    } else {
      return 0;
    }
  };

  // 将文本转换为包含可点击时间戳的React元素
  const renderTextWithTimestamps = (text: string) => {
    const timestampRegex = /\[(\d+)(?::(\d+))?(?::(\d+))?\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = timestampRegex.exec(text)) !== null) {
      // 添加时间戳前的文本
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // 添加可点击的时间戳
      const timestamp = match[0];
      const seconds = parseTimestamp(timestamp);
      parts.push(
        <button
          key={match.index}
          onClick={() => setPlayerOptions(prev => ({ ...prev, t: seconds }))}
          className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
        >
          {timestamp}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余文本
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* 顶部导航栏 */}
      <nav className="bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>返回课程列表</span>
              </button>
              <div className="flex items-center space-x-2 bg-blue-900/30 px-3 py-1 rounded">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
                </svg>
                <span className="font-medium">B站视频播放器</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user && (
                  <span className="text-gray-300">
                    欢迎, {user.username || user.name || user.email || '用户'}
                  </span>
                )}
              </div>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{courseName}</h1>
          <p className="text-gray-400">视频ID: <code className="ml-2 bg-gray-800 px-2 py-1 rounded">{bvid}</code></p>
        </div>

        <div className="flex space-x-6">
          {/* 左侧播放器区域 - 固定在左上角 */}
          <div className="flex-1">
            {/* 播放器控制栏 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-t-lg p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">B站视频播放</h2>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={playerOptions.autoplay}
                        onChange={(e) => setPlayerOptions(prev => ({ ...prev, autoplay: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span>自动播放</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={playerOptions.danmaku}
                        onChange={(e) => setPlayerOptions(prev => ({ ...prev, danmaku: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span>显示弹幕</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={playerOptions.muted}
                        onChange={(e) => setPlayerOptions(prev => ({ ...prev, muted: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span>静音</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResize(-100)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                      disabled={playerOptions.width <= 400}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-sm">
                      尺寸: {playerOptions.width}×{Math.round(playerOptions.height)}
                    </span>
                    <button
                      onClick={() => handleResize(100)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                      disabled={playerOptions.width >= 1200}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPlayerOptions(prev => ({ ...prev, p: Math.max(1, prev.p - 1) }))}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-1"
                    disabled={playerOptions.p <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>上一个P</span>
                  </button>
                  <div className="px-3 py-1 bg-gray-700 rounded">
                    <span>当前: P{playerOptions.p}</span>
                  </div>
                  <button
                    onClick={() => setPlayerOptions(prev => ({ ...prev, p: prev.p + 1 }))}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-1"
                  >
                    <span>下一个P</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={handleJumpToTime}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>跳转到 {playerOptions.t}秒</span>
                </button>
                
                <button
                  onClick={() => setPlayerOptions(prev => ({ ...prev, t: 0 }))}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                  <span>回到开头</span>
                </button>
              </div>
            </div>

            {/* B站播放器 */}
            <div className="bg-gray-900 rounded-b-lg p-4">
              <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl" style={{
                width: playerOptions.width,
                height: playerOptions.height
              }}>
                <iframe
                  src={buildBilibiliUrl()}
                  className="absolute inset-0 w-full h-full border-0"
                  scrolling="no"
                  frameBorder="no"
                  allowFullScreen
                  title="B站视频播放器"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              
              {/* 操作按钮 */}
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => window.open(`https://www.bilibili.com/video/${bvid}`, '_blank')}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
                  </svg>
                  <span>在B站打开</span>
                </button>
                
                <button
                  onClick={() => handleResize(800)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>重置大小</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧信息面板 */}
          <div className="w-80 space-y-6">
            {/* 视频信息 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                播放信息
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-900 px-3 py-2 rounded">
                    <div className="text-sm text-gray-400">视频ID</div>
                    <div className="font-mono text-sm truncate">{bvid}</div>
                  </div>
                  <div className="bg-gray-900 px-3 py-2 rounded">
                    <div className="text-sm text-gray-400">当前集数</div>
                    <div className="font-medium">P{playerOptions.p}</div>
                  </div>
                </div>
                <div className="bg-gray-900 px-3 py-2 rounded">
                  <div className="text-sm text-gray-400">播放时间</div>
                  <div className="font-medium">{playerOptions.t}秒</div>
                </div>
              </div>
            </div>



            {/* 视频总结 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                视频总结
              </h3>
              
              {isLoadingSummary ? (
                <div className="flex items-center justify-center p-6">
                  <svg className="animate-spin h-6 w-6 text-blue-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-400">正在获取视频总结...</span>
                </div>
              ) : summaryError ? (
                <div className="bg-red-500/20 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-400">{summaryError}</p>
                    </div>
                  </div>
                </div>
              ) : videoSummary ? (
                <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {renderTextWithTimestamps(videoSummary)}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-500 text-center">暂无视频总结</p>
                </div>
              )}
            </div>

            {/* 复制链接 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                分享链接
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  readOnly
                  value={`https://www.bilibili.com/video/${bvid}`}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://www.bilibili.com/video/${bvid}`);
                    alert('链接已复制到剪贴板');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors"
                >
                  复制链接
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="mt-8 text-center text-gray-500 text-sm pb-4">
        <p>B站视频播放器 - 仅供学习使用 | 视频内容版权归Bilibili及UP主所有</p>
      </div>
    </div>
  );
};

export default BilibiliPlayerPage;