import React, { useRef, useState, useEffect } from 'react';

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

interface BilibiliPlayerProps {
  bvid: string;
  courseName: string;
  onClose: () => void;
}

const BilibiliPlayer: React.FC<BilibiliPlayerProps> = ({ bvid, courseName, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [playerOptions, setPlayerOptions] = useState({
    autoplay: true,
    muted: false,
    danmaku: true,
    t: 0,
    p: 1
  });
  const [size, setSize] = useState({ width: 900, height: 506 }); // 16:9比例
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 视频总结相关状态
  const [videoSummary, setVideoSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string>('');
  
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
  
  // 组件挂载时获取视频总结
  useEffect(() => {
    fetchVideoSummary();
  }, [bvid]);

  // 构建B站播放器URL
  const buildBilibiliUrl = () => {
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

  // 拖拽功能
  const handleMouseDown = () => {
    if (!isFullscreen) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isFullscreen) {
      const x = e.clientX - size.width / 2;
      const y = e.clientY - size.height / 2 - 40; // 考虑标题栏高度
      
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height - 40;
      
      setPosition({
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 全屏功能
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
      // 全屏时居中显示
      setPosition({ x: 0, y: 0 });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // 监听全屏变化
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isDragging, size]);

  // 调整播放器大小
  const handleResize = (delta: number) => {
    if (isFullscreen) return;
    
    const newWidth = Math.max(400, Math.min(1200, size.width + delta));
    const newHeight = newWidth * (9 / 16); // 保持16:9比例
    setSize({ width: newWidth, height: newHeight });
  };

  // 跳转到指定时间
  const handleJumpToTime = () => {
    const time = prompt('请输入要跳转的时间（秒）:', playerOptions.t.toString());
    if (time !== null) {
      const seconds = parseInt(time) || 0;
      setPlayerOptions(prev => ({ ...prev, t: Math.max(0, seconds) }));
      
      // 重新加载iframe以应用新时间
      if (iframeRef.current) {
        iframeRef.current.src = buildBilibiliUrl();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* B站播放器容器 */}
      <div
        ref={containerRef}
        className={`absolute bg-white rounded-lg shadow-2xl overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-move'}`}
        style={{
          left: isFullscreen ? 0 : `${position.x}px`,
          top: isFullscreen ? 0 : `${position.y}px`,
          width: isFullscreen ? '100vw' : `${size.width}px`,
          height: isFullscreen ? '100vh' : `${size.height + 80}px`, // 增加标题栏和控制栏高度
          zIndex: 1000
        }}
      >
        {/* 标题栏 */}
        <div
          className={`bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 flex justify-between items-center ${isFullscreen ? 'hidden' : ''}`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white/20 px-2 py-1 rounded">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
              </svg>
              <span className="text-xs font-bold">Bilibili</span>
            </div>
            <h3 className="font-semibold truncate max-w-md">{courseName}</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPlayerOptions(prev => ({ ...prev, autoplay: !prev.autoplay }))}
              className={`px-3 py-1 rounded text-sm ${playerOptions.autoplay ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
              title={playerOptions.autoplay ? '关闭自动播放' : '开启自动播放'}
            >
              {playerOptions.autoplay ? '自动播放:开' : '自动播放:关'}
            </button>
            <button
              onClick={() => setPlayerOptions(prev => ({ ...prev, danmaku: !prev.danmaku }))}
              className={`px-3 py-1 rounded text-sm ${playerOptions.danmaku ? 'bg-pink-500 hover:bg-pink-600' : 'bg-gray-500 hover:bg-gray-600'}`}
              title={playerOptions.danmaku ? '关闭弹幕' : '开启弹幕'}
            >
              {playerOptions.danmaku ? '弹幕:开' : '弹幕:关'}
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? '退出全屏' : '全屏'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
              title="关闭"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* 播放器主体 */}
        <div className="relative w-full bg-black" style={{ height: isFullscreen ? 'calc(100vh - 60px)' : `${size.height}px` }}>
          <iframe
            ref={iframeRef}
            src={buildBilibiliUrl()}
            className="w-full h-full border-0"
            scrolling="no"
            frameBorder="no"
            allowFullScreen
            title="B站视频播放器"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          
          {isFullscreen && (
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                关闭播放器
              </button>
            </div>
          )}
        </div>
        
        {/* 视频总结区域 */}
        <div className={`bg-white p-4 border-t ${isFullscreen ? 'hidden' : ''}`}>
          <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            视频总结
          </h4>
          
          {isLoadingSummary ? (
            <div className="flex items-center justify-center p-6">
              <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">正在获取视频总结...</span>
            </div>
          ) : summaryError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{summaryError}</p>
                </div>
              </div>
            </div>
          ) : videoSummary ? (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{videoSummary}</p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-500 text-center">暂无视频总结</p>
            </div>
          )}
        </div>
        
        {/* 控制栏 */}
        <div className={`bg-gray-100 p-3 flex justify-between items-center border-t ${isFullscreen ? 'hidden' : ''}`}>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-medium text-gray-700">视频ID:</span>
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded font-mono">{bvid}</code>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">当前播放:</span>
              <span className="ml-1 font-medium">P{playerOptions.p}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <button
                onClick={() => setPlayerOptions(prev => ({ ...prev, p: Math.max(1, prev.p - 1) }))}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm flex items-center"
                disabled={playerOptions.p <= 1}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                上一个P
              </button>
              <button
                onClick={() => setPlayerOptions(prev => ({ ...prev, p: prev.p + 1 }))}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm flex items-center"
              >
                下一个P
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <button
                onClick={handleJumpToTime}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                跳转到: {playerOptions.t}s
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleResize(-100)}
                disabled={size.width <= 400}
                className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                title="缩小"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                </svg>
              </button>
              <span className="text-sm text-gray-600">尺寸: {size.width}×{Math.round(size.height)}</span>
              <button
                onClick={() => handleResize(100)}
                disabled={size.width >= 1200}
                className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                title="放大"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BilibiliPlayer;