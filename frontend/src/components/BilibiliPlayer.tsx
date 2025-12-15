import React, { useRef, useState, useEffect } from 'react';
import { PlayerOptions, BibiGPTResponse } from './BilibiliPlayer/types';
import TitleBar from './BilibiliPlayer/TitleBar';
import PlayerMain from './BilibiliPlayer/PlayerMain';
import VideoSummary from './BilibiliPlayer/VideoSummary';
import ControlBar from './BilibiliPlayer/ControlBar';

interface BilibiliPlayerProps {
  bvid: string;
  courseName: string;
  onClose: () => void;
}

const BilibiliPlayer: React.FC<BilibiliPlayerProps> = ({ bvid, courseName, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [playerOptions, setPlayerOptions] = useState<PlayerOptions>({
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
      
      // 检查是否使用默认的占位API密钥
      if (apiKey === 'aroZX30hEzg3') {
        console.warn('使用的是默认占位API密钥，请替换为实际有效的API密钥');
        // 提供模拟数据作为示例
        const mockSummary = `这是一段模拟的视频总结示例。\n\n📺 视频主要内容包括：\n1. B站视频播放器的基本功能介绍\n2. 如何使用弹幕和自动播放功能\n3. 播放器的全屏和拖拽操作\n4. 视频总结功能的实现原理\n5. 如何调整播放器的尺寸和位置\n\n⏱️ 关键时间点：\n- 0:00 - 播放器初始化\n- 1:30 - 弹幕功能演示\n- 3:45 - 全屏操作说明\n- 5:20 - 视频总结获取`;
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        setVideoSummary(mockSummary);
        return;
      }
      
      // 实际API调用
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
            sentenceNumber: 5,
            detailLevel: 700,
            outputLanguage: "zh-CN"
          }
        })
      });
      
      if (!response.ok) {
        // 获取详细的错误信息
        let errorData;
        try {
          errorData = await response.json();
          console.error('API错误响应详情:', errorData);
          throw new Error(`API请求失败 (${response.status}): ${errorData.message || response.statusText}`);
        } catch (jsonError) {
          // 如果无法解析JSON，使用状态文本
          console.error('API错误响应状态:', response.status, response.statusText);
          throw new Error(`API请求失败 (${response.status}): ${response.statusText}`);
        }
      }
      
      const data: BibiGPTResponse = await response.json();
      console.log('API成功响应:', data);
      
      if (data.success) {
        setVideoSummary(data.summary);
      } else {
        console.error('API返回失败状态:', data);
        throw new Error(`获取视频总结失败: ${data.message || '未知错误'}`);
      }
      
    } catch (error) {
      console.error('获取视频总结时出错:', error);
      // 提供更详细的错误信息
      let errorMessage = '获取视频总结失败，请稍后重试';
      
      if (error instanceof Error) {
        // 处理CORS错误
        if (error.message.includes('CORS') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = '网络请求失败，可能是CORS限制导致。请检查浏览器控制台获取详细信息。';
        } else {
          errorMessage = `获取视频总结失败: ${error.message}`;
        }
      }
      
      setSummaryError(errorMessage);
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
        <TitleBar
          courseName={courseName}
          playerOptions={playerOptions}
          setPlayerOptions={setPlayerOptions}
          toggleFullscreen={toggleFullscreen}
          onClose={onClose}
          isFullscreen={isFullscreen}
          handleMouseDown={handleMouseDown}
        />
        
        {/* 播放器主体 */}
        <PlayerMain
          buildBilibiliUrl={buildBilibiliUrl}
          size={size}
          isFullscreen={isFullscreen}
          onClose={onClose}
          iframeRef={iframeRef}
        />
        
        {/* 视频总结区域 */}
        <VideoSummary
          videoSummary={videoSummary}
          isLoadingSummary={isLoadingSummary}
          summaryError={summaryError}
          isFullscreen={isFullscreen}
        />
        
        {/* 控制栏 */}
        <ControlBar
          bvid={bvid}
          playerOptions={playerOptions}
          setPlayerOptions={setPlayerOptions}
          handleResize={handleResize}
          size={size}
          isFullscreen={isFullscreen}
        />
      </div>
    </div>
  );
};

export default BilibiliPlayer;