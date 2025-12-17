import { type RefObject, useMemo } from 'react';
import type { Subtitle } from '../../data/mock';

interface VideoPlayerProps {
  videoUrl: string;
  currentTime: number;
  subtitles: Subtitle[];
  videoRef: RefObject<HTMLVideoElement | null>;
  onLoadedMetadata: () => void;
  captionText: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  showBackground: boolean;
  showStroke: boolean;
}

const VideoPlayer = ({
  videoUrl,
  currentTime,
  subtitles,
  videoRef,
  onLoadedMetadata,
  captionText,
  fontSize,
  textAlign,
  showBackground,
  showStroke
}: VideoPlayerProps) => {
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onLoadedMetadata={onLoadedMetadata}
        preload="metadata"
      />

      {/* Subtitle Overlay */}
      {captionText && (
        <div className={`absolute inset-0 flex items-end pb-16 pointer-events-none ${
          textAlign === 'left' ? 'justify-start pl-8' : textAlign === 'right' ? 'justify-end pr-8' : 'justify-center'
        }`}>
          <div 
            className={`px-6 py-3 rounded-lg ${showBackground ? 'bg-zinc-900/90' : ''} ${showStroke ? 'border-2 border-white' : ''}`}
          >
            <p 
              className="font-bold leading-tight"
              style={{
                fontSize: `${fontSize}px`,
                color: '#ffffff',
                textAlign: textAlign,
                textShadow: showStroke ? `
                  -1px -1px 0 #000,
                  1px -1px 0 #000,
                  -1px 1px 0 #000,
                  1px 1px 0 #000
                ` : 'none'
              }}
            >
              {captionText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
