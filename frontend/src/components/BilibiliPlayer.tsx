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
  const [videoEvents, setVideoEvents] = useState<Array<{time: string; message: string}>>([]);
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
        // 提供模拟数据作为示例 - 使用与API响应相同的JSON格式
        const mockJsonResponse = {
          summary: "这是一段模拟的视频总结示例。视频主要内容包括B站视频播放器的基本功能介绍、如何使用弹幕和自动播放功能、播放器的全屏和拖拽操作、视频总结功能的实现原理以及如何调整播放器的尺寸和位置。",
          events: [
            { time: "00:00:00", message: "播放器初始化" },
            { time: "00:01:30", message: "弹幕功能演示" },
            { time: "00:03:45", message: "全屏操作说明" },
            { time: "00:05:20", message: "视频总结获取" }
          ]
        };
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        setVideoSummary(mockJsonResponse.summary);
        setVideoEvents(mockJsonResponse.events);
        return;
      }
      
      // 实际API调用
      const response = await fetch('https://api.bibigpt.co/api/v1/summarizeWithConfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({          url: videoUrl,          includeDetail: true,          promptConfig: {            customPrompt: "请以第三方客观视角处理以下内容，并严格遵守以下要求：\n\n【处理要求】\n1. 使用完全客观的第三方视角，避免任何作者视角或主观表述\n2. 不提及自身身份或角色\n3. 基于内容生成有意义的时间戳作为导航\n4. 时间戳应合理分布，反映内容的关键节点\n5. 每个时间戳至少要保证不少于15s的间隔\n6. 时间戳尽可能覆盖足够的视频时长而不是集中于某一部分\n\n【输出格式】\n必须返回且仅返回以下JSON格式，绝对不要在JSON前后添加任何其他内容，包括但不限于Markdown反引号(```)、注释、解释或其他文本：\n{\n  \"summary\": \"客观总结内容，概括主要内容\",\n  \"events\": [\n    {\"time\": \"hh:mm:ss\", \"message\": \"具体事件描述\"},\n    {\"time\": \"hh:mm:ss\", \"message\": \"具体事件描述\"}\n  ]\n}\n\n【重要规则】\n- JSON必须是有效的、可解析的格式\n- 时间戳格式必须是\"hh:mm:ss\"\n- events数组应按时间顺序排列\n- 不要添加任何额外的文本、解释或Markdown标记\n- 绝对不要在JSON前后添加Markdown反引号(```)或其他任何符号",            showEmoji: true,            showTimestamp: true,            sentenceNumber: 5,            detailLevel: 700,            outputLanguage: "zh-CN",            isRefresh: true          }        })
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
        // 尝试解析返回的JSON内容，因为API可能返回JSON字符串
        try {
          // 移除可能存在的Markdown反引号和JSON标签
          let cleanedSummary = data.summary;
          if (cleanedSummary.startsWith('```json')) {
            cleanedSummary = cleanedSummary.slice(7);
          } else if (cleanedSummary.startsWith('```')) {
            cleanedSummary = cleanedSummary.slice(3);
          }
          if (cleanedSummary.endsWith('```')) {
            cleanedSummary = cleanedSummary.slice(0, -3);
          }
          // 去除首尾空格
          cleanedSummary = cleanedSummary.trim();
          
          const parsedContent = JSON.parse(cleanedSummary);
          setVideoSummary(parsedContent.summary);
          if (parsedContent.events) {
            setVideoEvents(parsedContent.events);
          }
        } catch (e) {
          // 如果解析失败，说明返回的是普通文本
          setVideoSummary(data.summary);
          setVideoEvents([]);
        }
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
  
  // 跳转到指定时间点
  const onJumpToTime = (seconds: number) => {
    setPlayerOptions(prev => ({ ...prev, t: seconds }));
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
        
        {/* 视频时间点导航 */}
        {videoEvents.length > 0 && (
          <div className="px-4 py-3 bg-gray-900 border-t border-gray-700">
            <h3 className="text-lg font-bold mb-2 text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              视频时间点导航
            </h3>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {videoEvents.map((event, index) => {
                // 解析时间戳格式 hh:mm:ss 为秒数
                const parseHMS = (time: string): number => {
                  const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
                  return hours * 3600 + minutes * 60 + seconds;
                };
                
                return (
                  <button
                    key={index}
                    onClick={() => onJumpToTime(parseHMS(event.time))}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm rounded transition-colors flex items-center whitespace-nowrap"
                    title={event.message}
                  >
                    <span className="font-mono text-white">{event.time}</span>
                    <span className="ml-2 text-xs opacity-80 text-white">{event.message}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
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