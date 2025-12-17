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
      className="relative h-full overflow-x-auto overflow-y-hidden bg-zinc-950 cursor-pointer group"
      onClick={handleTimelineClick}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(251, 191, 36, 0.05) 1px, transparent 1px)
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
        <div className="absolute top-0 left-0 right-0 h-12 border-b border-zinc-800/50">
          {timeMarkers.map((second) => (
            <div
              key={second}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${second * PIXELS_PER_SECOND}px` }}
            >
              <div className="w-px h-3 bg-zinc-700" />
              <span className="text-xs text-zinc-600 font-mono mt-1">
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
                className={`absolute top-2 h-16 rounded-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 shadow-lg shadow-amber-500/50'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500 hover:border-blue-400 shadow-md'
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
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {subtitle.text}
                  </p>
                </div>
                
                {/* Active indicator pulse */}
                {isActive && (
                  <div className="absolute top-0 right-0 w-2 h-2 m-1">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping" />
                    <div className="absolute inset-0 bg-white rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Playhead (Red Line) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-lg shadow-red-500/50 z-10 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${currentTime * PIXELS_PER_SECOND}px`,
            opacity: currentTime > 0 ? 1 : 0
          }}
        >
          {/* Playhead top triangle */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2">
            <div 
              className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500"
            />
          </div>
          
          {/* Playhead glow effect */}
          <div className="absolute inset-0 bg-red-500 blur-sm opacity-50" />
        </div>

        {/* Hover time indicator */}
        <div className="absolute top-0 left-0 w-px h-12 bg-zinc-500/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  );
};

export default Timeline;
