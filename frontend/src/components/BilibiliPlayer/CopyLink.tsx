import React, { useState } from 'react';

interface CopyLinkProps {
  bvid: string;
  currentUrl: string;
}

const CopyLink: React.FC<CopyLinkProps> = ({ bvid, currentUrl }) => {
  const [copySuccess, setCopySuccess] = useState('');
  
  // 获取B站视频链接
  const bilibiliUrl = `https://www.bilibili.com/video/${bvid}`;
  
  // 复制链接到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`已复制${type}链接到剪贴板！`);
      
      // 3秒后清除成功提示
      setTimeout(() => {
        setCopySuccess('');
      }, 3000);
    } catch (err) {
      console.error('无法复制链接:', err);
      setCopySuccess('复制失败，请手动复制！');
      
      // 3秒后清除失败提示
      setTimeout(() => {
        setCopySuccess('');
      }, 3000);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5">
      <h3 className="text-lg font-bold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        复制链接
      </h3>
      
      {/* 复制成功提示 */}
      {copySuccess && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-4">
          <div className="text-green-400 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {copySuccess}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {/* 当前页面链接 */}
        <div>
          <div className="text-sm text-gray-400 mb-2">当前页面链接</div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentUrl}
              readOnly
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm truncate"
            />
            <button
              onClick={() => copyToClipboard(currentUrl, '当前页面')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center space-x-1"
              title="复制当前页面链接"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>复制</span>
            </button>
          </div>
        </div>
        
        {/* B站原始视频链接 */}
        <div>
          <div className="text-sm text-gray-400 mb-2">B站视频链接</div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={bilibiliUrl}
              readOnly
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm truncate"
            />
            <button
              onClick={() => copyToClipboard(bilibiliUrl, 'B站视频')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center space-x-1"
              title="复制B站视频链接"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>复制</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyLink;
