import React from 'react';

interface PlayerOptions {
  autoplay: boolean;
  muted: boolean;
  danmaku: boolean;
  t: number;
  p: number;
  width: number;
  height: number;
}

interface PlayerControlBarProps {
  playerOptions: PlayerOptions;
  setPlayerOptions: React.Dispatch<React.SetStateAction<PlayerOptions>>;
  handleResize: (delta: number) => void;
}

const PlayerControlBar: React.FC<PlayerControlBarProps> = ({
  playerOptions,
  setPlayerOptions,
  handleResize
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-t-lg p-4 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">B站视频播放</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={playerOptions.autoplay}
                onChange={(e) => setPlayerOptions(prev => ({ ...prev, autoplay: e.target.checked }))}
                className="w-4 h-4"
              />
              <span>自动播放</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={playerOptions.danmaku}
                onChange={(e) => setPlayerOptions(prev => ({ ...prev, danmaku: e.target.checked }))}
                className="w-4 h-4"
              />
              <span>显示弹幕</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={playerOptions.muted}
                onChange={(e) => setPlayerOptions(prev => ({ ...prev, muted: e.target.checked }))}
                className="w-4 h-4"
              />
              <span>静音</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleResize(-100)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
              disabled={playerOptions.width <= 400}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm">
              尺寸: {playerOptions.width}×{Math.round(playerOptions.height)}
            </span>
            <button
              onClick={() => handleResize(100)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
              disabled={playerOptions.width >= 1200}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 mt-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPlayerOptions(prev => ({ ...prev, p: Math.max(1, prev.p - 1) }))}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-1"
            disabled={playerOptions.p <= 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>上一个P</span>
          </button>
          <div className="px-3 py-1 bg-gray-700 rounded">
            <span>当前: P{playerOptions.p}</span>
          </div>
          <button
            onClick={() => setPlayerOptions(prev => ({ ...prev, p: prev.p + 1 }))}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-1"
          >
            <span>下一个P</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        

      </div>
    </div>
  );
};

export default PlayerControlBar;