import React from 'react';

interface PlayerMainProps {
  buildBilibiliUrl: () => string;
  size: { width: number; height: number };
  isFullscreen: boolean;
  onClose: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const PlayerMain: React.FC<PlayerMainProps> = ({ buildBilibiliUrl, size, isFullscreen, onClose, iframeRef }) => {
  return (
    <div className="relative w-full bg-black" style={{ height: isFullscreen ? 'calc(100vh - 60px)' : `${size.height}px` }}>
      <iframe
        ref={iframeRef}
        src={buildBilibiliUrl()}
        className="w-full h-full border-0"
        scrolling="no"
        frameBorder="no"
        allowFullScreen
        title="B站视频播放器"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
      
      {isFullscreen && (
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            关闭播放器
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerMain;
