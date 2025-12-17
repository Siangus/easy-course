import React from 'react';

interface VideoInfoProps {
  bvid: string;
  playerOptions: {
    p: number;
    t: number;
  };
}

const VideoInfo: React.FC<VideoInfoProps> = ({ bvid, playerOptions }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5">
      <h3 className="text-lg font-bold mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        播放信息
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-900 px-3 py-2 rounded">
            <div className="text-sm text-gray-400">视频ID</div>
            <div className="font-mono text-sm truncate">{bvid}</div>
          </div>
          <div className="bg-gray-900 px-3 py-2 rounded">
            <div className="text-sm text-gray-400">当前集数</div>
            <div className="font-medium">P{playerOptions.p}</div>
          </div>
        </div>
        <div className="bg-gray-900 px-3 py-2 rounded">
          <div className="text-sm text-gray-400">播放时间</div>
          <div className="font-medium">{playerOptions.t}秒</div>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
