import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import Timeline from './Timeline';
import type { Subtitle } from '../../data/mock';

interface VideoEditorProps {
  videoUrl: string;
  subtitles: Subtitle[];
  onSubtitlesChange?: (subtitles: Subtitle[]) => void;
}

type FontFamily = 'Montserrat' | 'Playfair Display' | 'Space Mono' | 'Bebas Neue' | 'Crimson Pro';
type Position = 'Top' | 'Center' | 'Bottom';

const VideoEditor = ({ videoUrl, subtitles: initialSubtitles, onSubtitlesChange }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>(initialSubtitles);
  const [activeSubtitleId, setActiveSubtitleId] = useState<string | null>(null);
  
  // Style controls
  const [selectedFont, setSelectedFont] = useState<FontFamily>('Montserrat');
  const [selectedColor, setSelectedColor] = useState('#FCD34D');
  const [selectedPosition, setSelectedPosition] = useState<Position>('Bottom');
  const [transcriptText, setTranscriptText] = useState('');

  // Find active subtitle
  const activeSubtitle = subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  useEffect(() => {
    if (activeSubtitle && activeSubtitle.id !== activeSubtitleId) {
      setActiveSubtitleId(activeSubtitle.id);
      setTranscriptText(activeSubtitle.text);
    } else if (!activeSubtitle && activeSubtitleId !== null) {
      setActiveSubtitleId(null);
    }
  }, [activeSubtitle, activeSubtitleId]);


  // Video time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const skipBackward = () => {
    handleSeek(Math.max(0, currentTime - 5));
  };

  const skipForward = () => {
    handleSeek(Math.min(duration, currentTime + 5));
  };

  const handleSubtitleClick = (subtitle: Subtitle) => {
    handleSeek(subtitle.start);
    setTranscriptText(subtitle.text);
  };

  const handleTranscriptChange = (newText: string) => {
    setTranscriptText(newText);
  };

  const handleSaveChanges = () => {
    if (activeSubtitleId && transcriptText) {
      const updatedSubtitles = subtitles.map(sub => 
        sub.id === activeSubtitleId ? { ...sub, text: transcriptText } : sub
      );
      setSubtitles(updatedSubtitles);
      onSubtitlesChange?.(updatedSubtitles);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };


  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Video Player Stage (60%) */}
        <div className="w-[60%] flex flex-col bg-zinc-900">
          
          {/* Video Display Area */}
          <div className="flex-1 relative bg-black">
            <VideoPlayer
              videoUrl={videoUrl}
              currentTime={currentTime}
              subtitles={subtitles}
              videoRef={videoRef}
              onLoadedMetadata={handleLoadedMetadata}
              captionText={activeSubtitle?.text || ''}
              fontSize={42}
              textAlign="center"
              showBackground={false}
              showStroke={true}
            />

            {/* Center Play/Pause Overlay */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity hover:bg-black/30"
                onClick={togglePlayPause}
              >
                <div className="w-20 h-20 rounded-full bg-amber-500 shadow-2xl shadow-amber-500/50 flex items-center justify-center hover:bg-amber-400 transition-all hover:scale-110">
                  <Play className="w-10 h-10 text-black ml-1" fill="black" />
                </div>
              </div>
            )}
          </div>

          {/* Video Controls Bar */}
          <div className="h-20 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={skipBackward}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlayPause}
                className="p-3 rounded-lg bg-amber-500 hover:bg-amber-400 transition-all hover:scale-105 shadow-lg shadow-amber-500/30"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-black" fill="black" />
                ) : (
                  <Play className="w-6 h-6 text-black" fill="black" />
                )}
              </button>
              
              <button
                onClick={skipForward}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-zinc-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="h-32 bg-zinc-950 border-t border-zinc-800">
            <Timeline
              currentTime={currentTime}
              duration={duration}
              subtitles={subtitles}
              onSeek={handleSeek}
            />
          </div>
        </div>

        {/* Right: Script Sidebar (40%) */}
        <div className="w-[40%] bg-zinc-900 border-l border-zinc-800 flex flex-col">
          
          {/* Transcript Editor */}
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">Transcript</h3>
            <textarea
              value={transcriptText}
              onChange={(e) => handleTranscriptChange(e.target.value)}
              placeholder="Select a subtitle to edit..."
              className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none font-sans"
            />
          </div>

          {/* Style Controls */}
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Style Controls</h3>
            
            {/* Font Selector */}
            <div className="mb-4">
              <label className="text-sm text-zinc-400 mb-2 block">Font:</label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value as FontFamily)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="Montserrat">Montserrat</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Space Mono">Space Mono</option>
                <option value="Bebas Neue">Bebas Neue</option>
                <option value="Crimson Pro">Crimson Pro</option>
              </select>
            </div>

            {/* Color Selector */}
            <div className="mb-4">
              <label className="text-sm text-zinc-400 mb-2 block">Color:</label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="#FCD34D">Yellow</option>
                  <option value="#EF4444">Red</option>
                  <option value="#3B82F6">Blue</option>
                  <option value="#10B981">Green</option>
                  <option value="#FFFFFF">White</option>
                </select>
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-zinc-700 shadow-inner"
                  style={{ backgroundColor: selectedColor }}
                />
              </div>
            </div>

            {/* Position Selector */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Position:</label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value as Position)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="Top">Top</option>
                <option value="Center">Center</option>
                <option value="Bottom">Bottom</option>
              </select>
            </div>
          </div>

          {/* Subtitle List */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Subtitles</h3>
            <div className="space-y-3">
              {subtitles.map((subtitle) => {
                const isActive = subtitle.id === activeSubtitleId;
                
                return (
                  <div
                    key={subtitle.id}
                    onClick={() => handleSubtitleClick(subtitle)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30'
                        : 'bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-mono ${
                        isActive ? 'text-black/70' : 'text-zinc-500'
                      }`}>
                        {formatTime(subtitle.start)} - {formatTime(subtitle.end)}
                      </span>
                      {isActive && (
                        <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      isActive ? 'text-black font-medium' : 'text-zinc-300'
                    }`}>
                      {subtitle.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6 border-t border-zinc-800">
            <button
              onClick={handleSaveChanges}
              disabled={!activeSubtitleId}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                activeSubtitleId
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 hover:scale-[1.02]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
