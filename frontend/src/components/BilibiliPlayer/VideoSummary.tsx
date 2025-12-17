import React from 'react';

interface VideoSummaryProps {
  videoSummary: string;
  isLoadingSummary: boolean;
  summaryError: string;
  onReloadSummary: () => void;
  onJumpToTime: (seconds: number) => void;
}

const VideoSummary: React.FC<VideoSummaryProps> = ({ 
  videoSummary, 
  isLoadingSummary, 
  summaryError, 
  onReloadSummary, 
  onJumpToTime 
}) => {
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
          onClick={() => onJumpToTime(seconds)}
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
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5">
      <h3 className="text-lg font-bold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        视频总结
      </h3>

      {isLoadingSummary ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
          <span>正在获取视频总结...</span>
        </div>
      ) : summaryError ? (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
          <div className="text-red-400 mb-3">{summaryError}</div>
          <button
            onClick={onReloadSummary}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm"
          >
            重新加载
          </button>
        </div>
      ) : videoSummary ? (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {renderTextWithTimestamps(videoSummary)}
          </p>
          <button
            onClick={onReloadSummary}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重新加载总结
          </button>
        </div>
      ) : (
        <div className="text-gray-400 py-8 text-center">
          <p>暂无视频总结</p>
          <button
            onClick={onReloadSummary}
            className="mt-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
          >
            获取总结
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoSummary;
