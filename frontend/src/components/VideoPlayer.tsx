import React, { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  courseName: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, courseName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPiP, setIsPiP] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 画中画功能
  const togglePiP = async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (error) {
      console.error('画中画错误:', error);
    }
  };

  // 拖拽功能
  const handleMouseDown = (_e: React.MouseEvent) => {
    if (!isPiP) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const x = e.clientX - container.width / 2;
      const y = e.clientY - container.height / 2;
      
      // 限制在窗口内
      const maxX = window.innerWidth - container.width;
      const maxY = window.innerHeight - container.height;
      
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
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 视频容器 */}
      <div
        ref={containerRef}
        className={`absolute ${isPiP ? 'picture-in-picture' : ''}`}
        style={{
          left: isPiP ? 'auto' : `${position.x}px`,
          top: isPiP ? 'auto' : `${position.y}px`,
          width: isPiP ? 'auto' : '800px',
          height: isPiP ? 'auto' : '450px',
          zIndex: 1000
        }}
      >
        {/* 标题栏 */}
        <div
          className={`bg-gray-800 text-white p-3 flex justify-between items-center ${isPiP ? 'hidden' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
        >
          <h3 className="font-semibold truncate">{courseName}</h3>
          <div className="flex space-x-2">
            <button
              onClick={togglePiP}
              className="p-1 hover:bg-gray-700 rounded"
              title="画中画"
            >
              {isPiP ? '退出画中画' : '画中画'}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:bg-gray-700 rounded"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? '退出全屏' : '全屏'}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-600 rounded"
              title="关闭"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* 视频播放器 */}
        <video
          ref={videoRef}
          src={videoUrl || ''}
          className="w-full h-full bg-black"
          controls
          autoPlay
          playsInline
        >
          您的浏览器不支持视频播放
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;
