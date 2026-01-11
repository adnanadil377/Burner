import { useRef, type MouseEvent } from 'react';
import type { Subtitle } from '../../data/mock';

interface TimelineProps {
  currentTime: number;
  duration: number;
  subtitles: Subtitle[];
  onSeek: (time: number) => void;
}

const PIXELS_PER_SECOND = 100;

const Timeline = ({ currentTime, duration, subtitles, onSeek }: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineWidth = Math.max(duration * PIXELS_PER_SECOND, 2000);

  const handleTimelineClick = (e: MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
      const newTime = clickX / PIXELS_PER_SECOND;
      onSeek(Math.max(0, Math.min(newTime, duration)));
    }
  };

  // Generate time markers every second
  const timeMarkers = [];
  for (let i = 0; i <= Math.ceil(duration); i++) {
    timeMarkers.push(i);
  }

  return (
    <div
      ref={timelineRef}
      className="relative h-5/6 overflow-x-auto overflow-y-hidden bg-[#111022] cursor-pointer group"
      onClick={handleTimelineClick}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: `${PIXELS_PER_SECOND}px 100%`
      }}
    >
      {/* Timeline content wrapper */}
      <div
        className="relative h-full"
        style={{ width: `${timelineWidth}px`, minHeight: '100%' }}
      >
        {/* Time markers */}
        <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/5">
          {timeMarkers.map((second) => (
            <div
              key={second}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${second * PIXELS_PER_SECOND}px` }}
            >
              <div className="w-px h-2 bg-gray-700" />
              <span className="text-[10px] text-gray-600 font-mono mt-0.5">
                {second}s
              </span>
            </div>
          ))}
        </div>

        {/* Subtitle blocks layer */}
        <div className="absolute top-16 left-0 right-0 h-20">
          {subtitles.map((subtitle) => {
            const left = subtitle.start * PIXELS_PER_SECOND;
            const width = (subtitle.end - subtitle.start) * PIXELS_PER_SECOND;
            const isActive = currentTime >= subtitle.start && currentTime <= subtitle.end;

            return (
              <div
                key={subtitle.id}
                className={`absolute top-2 h-14 rounded-lg border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : 'bg-[#1A1A28] border-white/10 hover:border-white/20'
                }`}
                style={{
                  left: `${left}px`,
                  width: `${width}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(subtitle.start);
                }}
              >
                <div className="px-3 py-2 h-full flex items-center">
                  <p className="text-xs text-white/80 truncate">
                    {subtitle.text}
                  </p>
                </div>
                
                {/* Active indicator pulse */}
                {isActive && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5">
                    <div className="absolute inset-0 bg-purple-400 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Playhead (Purple Line) */}
        <div
          className="absolute top-0 bottom-0 w-px bg-purple-500 z-10 pointer-events-none"
          style={{
            left: `${currentTime * PIXELS_PER_SECOND}px`,
            opacity: currentTime > 0 ? 1 : 0
          }}
        >
          {/* Playhead top triangle */}
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
            <div 
              className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-purple-500"
            />
          </div>
        </div>

        {/* Hover time indicator */}
        <div className="absolute top-0 left-0 w-px h-12 bg-gray-600/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  );
};

export default Timeline;
