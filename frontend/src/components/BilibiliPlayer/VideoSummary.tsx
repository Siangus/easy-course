import React from 'react';

interface VideoSummaryProps {
  videoSummary: string;
  isLoadingSummary: boolean;
  summaryError: string;
  isFullscreen: boolean;
}

const VideoSummary: React.FC<VideoSummaryProps> = ({ videoSummary, isLoadingSummary, summaryError, isFullscreen }) => {
  return (
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
  );
};

export default VideoSummary;
