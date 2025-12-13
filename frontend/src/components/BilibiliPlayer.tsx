import React, { useRef, useState, useEffect } from 'react';

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
            frameSpacing="0"
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