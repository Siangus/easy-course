import React from 'react';
import PlayerControlBar from './PlayerControlBar';

interface PlayerOptions {
  autoplay: boolean;
  muted: boolean;
  danmaku: boolean;
  t: number;
  p: number;
  width: number;
  height: number;
}

interface PlayerSectionProps {
  bvid: string;
  playerOptions: PlayerOptions;
  setPlayerOptions: React.Dispatch<React.SetStateAction<PlayerOptions>>;
  handleResize: (delta: number) => void;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({
  bvid,
  playerOptions,
  setPlayerOptions,
  handleResize
}) => {
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

  return (
    <div className="flex-1">
      {/* 播放器控制栏 */}
      <PlayerControlBar
        playerOptions={playerOptions}
        setPlayerOptions={setPlayerOptions}
        handleResize={handleResize}
      />

      {/* B站播放器 */}
      <div className="bg-gray-900 rounded-b-lg p-4">
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl" style={{
          width: playerOptions.width,
          height: playerOptions.height
        }}>
          <iframe
            src={buildBilibiliUrl()}
            className="absolute inset-0 w-full h-full border-0"
            scrolling="no"
            frameBorder="no"
            allowFullScreen
            title="B站视频播放器"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        
        {/* 操作按钮 */}
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => window.open(`https://www.bilibili.com/video/${bvid}`, '_blank')}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.223 3.086a1.25 1.25 0 010 1.768L17.086 5.996h1.17A3.75 3.75 0 0122 9.747v7.5a3.75 3.75 0 01-3.744 3.747H9.77a3.75 3.75 0 01-3.75-3.75v-1.19l-1.14 1.148a1.25 1.25 0 01-1.768-1.768l2.939-2.939a1.25 1.25 0 011.768 0l2.94 2.94a1.25 1.25 0 01-1.77 1.767l-1.138-1.14v1.189a1.25 1.25 0 001.25 1.25h8.486c.69 0 1.25-.56 1.25-1.25v-7.5a1.25 1.25 0 00-1.25-1.25h-8.5a1.25 1.25 0 00-1.25 1.25v.003L6.002 9.847v-2.56l1.14 1.15a1.25 1.25 0 101.768-1.767l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 001.768 1.768l1.14-1.148v2.56L2.93 9.157a1.25 1.25 0 111.768-1.768l1.138 1.148V9.747a3.75 3.75 0 013.75-3.75h1.17L5.777 4.855a1.25 1.25 0 011.768-1.768l2.939 2.94a1.25 1.25 0 001.768 0l2.94-2.94a1.25 1.25 0 011.768 1.768L13.168 5.996h3.087l-1.138-1.142a1.25 1.25 0 111.768-1.768l2.94 2.94a1.25 1.25 0 010 1.767l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142h-3.087l1.138 1.142a1.25 1.25 0 11-1.768 1.768l-2.94-2.94a1.25 1.25 0 00-1.768 0l-2.94 2.94a1.25 1.25 0 01-1.768-1.768l1.138-1.142z"/>
            </svg>
            <span>在B站打开</span>
          </button>
          
          <button
            onClick={() => handleResize(800)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>重置大小</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSection;