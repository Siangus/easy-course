import React from 'react';
import { PlayerOptions } from './types';

interface ControlBarProps {
  bvid: string;
  playerOptions: Pick<PlayerOptions, 'p' | 't'>;
  setPlayerOptions: React.Dispatch<React.SetStateAction<PlayerOptions>>;
  handleResize: (delta: number) => void;
  handleJumpToTime: () => void;
  size: { width: number; height: number };
  isFullscreen: boolean;
}

const ControlBar: React.FC<ControlBarProps> = ({ bvid, playerOptions, setPlayerOptions, handleResize, handleJumpToTime, size, isFullscreen }) => {
  return (
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
  );
};

export default ControlBar;
