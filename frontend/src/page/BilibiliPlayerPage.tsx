// page/BilibiliPlayerPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getUserFromStorage, logout } from '../services/auth';
// 导入子组件
import NavigationBar from '../components/BilibiliPlayer/NavigationBar';
import PlayerSection from '../components/BilibiliPlayer/PlayerSection';
import VideoInfo from '../components/BilibiliPlayer/VideoInfo';
import VideoSummary from '../components/BilibiliPlayer/VideoSummary';
import CopyLink from '../components/BilibiliPlayer/CopyLink';
import Footer from '../components/BilibiliPlayer/Footer';

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
  events?: Array<{
    time: string;
    message: string;
  }>;
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
  const [videoEvents, setVideoEvents] = useState<Array<{time: string; message: string}>>([]);
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

  

  // 用于VideoSummary组件的时间跳转函数
  const onJumpToTime = (seconds: number) => {
    setPlayerOptions(prev => ({ ...prev, t: seconds }));
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
        body: JSON.stringify({          url: videoUrl,          includeDetail: true,          promptConfig: {            customPrompt: "请以第三方客观视角处理以下内容，并严格遵守以下要求：\n\n【处理要求】\n1. 使用完全客观的第三方视角，避免任何作者视角或主观表述\n2. 不提及自身身份或角色\n3. 基于内容生成有意义的时间戳作为导航\n4. 时间戳应合理分布，反映内容的关键节点\n5. 每个时间戳至少要保证不少于15s的间隔\n6. 时间戳尽可能覆盖足够的视频时长而不是集中于某一部分\n\n【输出格式】\n必须返回且仅返回以下JSON格式，绝对不要在JSON前后添加任何其他内容，包括但不限于Markdown反引号(```)、注释、解释或其他文本：\n{\n  \"summary\": \"客观总结内容，概括主要内容\",\n  \"events\": [\n    {\"time\": \"hh:mm:ss\", \"message\": \"具体事件描述\"},\n    {\"time\": \"hh:mm:ss\", \"message\": \"具体事件描述\"}\n  ]\n}\n\n【重要规则】\n- JSON必须是有效的、可解析的格式\n- 时间戳格式必须是\"hh:mm:ss\"\n- events数组应按时间顺序排列\n- 不要添加任何额外的文本、解释或Markdown标记\n- 绝对不要在JSON前后添加Markdown反引号(```)或其他任何符号",            showEmoji: true,            showTimestamp: true,            outlineLevel: 1,            sentenceNumber: 5,            detailLevel: 700,            outputLanguage: "zh-CN",            isRefresh: true          }        })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.statusText}`);
      }
      
      const data: BibiGPTResponse = await response.json();
      
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



  // 获取当前页面URL
  const currentUrl = window.location.href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <NavigationBar
        user={user}
        onLogout={handleLogout}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{courseName}</h1>
          <p className="text-gray-400">视频ID: <code className="ml-2 bg-gray-800 px-2 py-1 rounded">{bvid}</code></p>
        </div>
        <div className="flex space-x-6">
          <div className="flex-1">
            <PlayerSection
              bvid={bvid}
              playerOptions={playerOptions}
              setPlayerOptions={setPlayerOptions}
              handleResize={handleResize}
            />
            {/* 视频时间点导航 */}
            {videoEvents.length > 0 && (
              <div className="mt-4 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  视频时间点导航
                </h3>
                <div className="flex flex-wrap gap-2">
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
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm rounded transition-colors flex items-center"
                        title={event.message}
                      >
                        <span className="font-mono">{event.time}</span>
                        <span className="ml-2 text-xs opacity-80">{event.message}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="w-80 space-y-6">
            <VideoInfo bvid={bvid} playerOptions={playerOptions} />
            <VideoSummary
              videoSummary={videoSummary}
              isLoadingSummary={isLoadingSummary}
              summaryError={summaryError}
              onJumpToTime={onJumpToTime}
              onReloadSummary={fetchVideoSummary}
            />
            <CopyLink bvid={bvid} currentUrl={currentUrl} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BilibiliPlayerPage;