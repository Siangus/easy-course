// page/BilibiliPlayerPage.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  
  // 分析相关状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('idle');
  const [analysisId, setAnalysisId] = useState<string>('');
  const [knowledgePoints, setKnowledgePoints] = useState<Array<{start_time: number; end_time?: number; content: string}>>([]);
  const [error, setError] = useState<string>('');
  const playerRef = useRef<HTMLIFrameElement>(null);

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

  // 分析视频
  const handleAnalyzeVideo = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisStatus('processing');
      setError('');
      setKnowledgePoints([]);

      // 调用分析API
      const response = await fetch('/api/video-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bvid })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '分析请求失败');
      }

      const { analysisId, status } = result.data;
      setAnalysisId(analysisId);
      setAnalysisStatus(status);

      // 如果状态已经是completed，直接获取结果
      if (status === 'completed') {
        await fetchAnalysisResult(analysisId);
      }
    } catch (error) {
      console.error('分析视频失败:', error);
      setError(error instanceof Error ? error.message : '分析视频失败');
      setAnalysisStatus('failed');
      setIsAnalyzing(false);
    }
  };

  // 获取分析结果
  const fetchAnalysisResult = async (id: string) => {
    try {
      const response = await fetch(`/api/video-analysis/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取分析结果失败');
      }

      const { status, knowledgePoints } = result.data;
      setAnalysisStatus(status);
      setKnowledgePoints(knowledgePoints);

      if (status === 'completed') {
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('获取分析结果失败:', error);
      setError(error instanceof Error ? error.message : '获取分析结果失败');
      setAnalysisStatus('failed');
      setIsAnalyzing(false);
    }
  };

  // 轮询分析结果
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (analysisId && analysisStatus === 'processing') {
      intervalId = setInterval(() => {
        fetchAnalysisResult(analysisId);
      }, 3000); // 每3秒轮询一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [analysisId, analysisStatus]);

  // 跳转到指定时间
  const jumpToTime = (seconds: number) => {
    if (playerRef.current) {
      // 使用postMessage与B站播放器通信
      const playerWindow = playerRef.current.contentWindow;
      if (playerWindow) {
        // 发送跳转到指定时间的命令
        playerWindow.postMessage({
          'biliplayer': {
            'cmd': 'seek',
            'value': seconds
          }
        }, '*');
      }
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millisecs = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millisecs.toString().padStart(2, '0')}`;
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
          <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
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
              
              {/* 分析按钮 */}
              <button
                onClick={handleAnalyzeVideo}
                disabled={isAnalyzing}
                className={`px-4 py-1 rounded flex items-center space-x-2 ml-4 ${isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{isAnalyzing ? '分析中...' : '分析视频'}</span>
              </button>
            </div>
          </div>

          {/* 分析状态显示 */}
          {analysisStatus !== 'idle' && (
            <div className="mb-4 p-3 rounded-lg flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${analysisStatus === 'completed' ? 'bg-green-500' : analysisStatus === 'processing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${analysisStatus === 'completed' ? 'text-green-600' : analysisStatus === 'processing' ? 'text-yellow-600' : 'text-red-600'}`}>
                {analysisStatus === 'completed' ? '分析完成' : analysisStatus === 'processing' ? '正在分析中...' : '分析失败'}
              </span>
              {error && (
                <span className="text-sm text-red-500 ml-2">{error}</span>
              )}
            </div>
          )}

          {/* B站播放器 */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{
            width: playerOptions.width,
            height: playerOptions.height
          }}>
            <iframe
              ref={playerRef}
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

          {/* 知识点列表 */}
          {knowledgePoints.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>知识点列表</span>
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-3">
                  {knowledgePoints.map((kp, index) => (
                    <li key={index} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => jumpToTime(kp.start_time)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium px-3 py-1 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                        >
                          {formatTime(kp.start_time)}
                        </button>
                        <div className="flex-1">
                          <p className="text-gray-700">{kp.content}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BilibiliPlayerPage;