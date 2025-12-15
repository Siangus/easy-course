import React from 'react';
import { PlayerOptions } from './types';

interface TitleBarProps {
  courseName: string;
  playerOptions: Pick<PlayerOptions, 'autoplay' | 'danmaku'>;
  setPlayerOptions: React.Dispatch<React.SetStateAction<PlayerOptions>>;
  toggleFullscreen: () => void;
  onClose: () => void;
  isFullscreen: boolean;
  handleMouseDown: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ courseName, playerOptions, setPlayerOptions, toggleFullscreen, onClose, isFullscreen, handleMouseDown }) => {
  return (
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
  );
};

export default TitleBar;
