import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Type, Palette, Layout, Box, Sparkles, Clock, ChevronLeft, ChevronRight, Monitor } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import Timeline from './Timeline';
import SubtitleDrawer, { type DrawerTab } from './SubtitleDrawer';
import ResolutionDropdown from './ResolutionDropdown';
import EditorSidebar from './EditorSidebar';
import type { Subtitle } from '../../data/mock';
import { captionPresets, type CaptionStyle } from '../../config/captionStyles';
import type { VideoResolution } from '../../config/videoResolutions';

interface VideoEditorProps {
  videoUrl: string;
  subtitles: Subtitle[];
  onSubtitlesChange?: (subtitles: Subtitle[]) => void;
}


const VideoEditor = ({ videoUrl, subtitles: initialSubtitles, onSubtitlesChange }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>(initialSubtitles);
  const [activeSubtitleId, setActiveSubtitleId] = useState<string | null>(null);
  
  // UI State
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('text');
  
  // Style controls - use full CaptionStyle
  const [currentStyle, setCurrentStyle] = useState<CaptionStyle>(captionPresets[0]);
  const [transcriptText, setTranscriptText] = useState('');
  
  // Resolution state
  const [selectedResolution, setSelectedResolution] = useState<VideoResolution | null>(null);

  // Handle style change from presets
  const handleStyleChange = (style: CaptionStyle) => {
    setCurrentStyle(style);
  };
  
  // Handle resolution change
  const handleResolutionChange = (resolution: VideoResolution) => {
    setSelectedResolution(resolution);
  };

  // Find active subtitle
  const activeSubtitle = subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  const currentIndex = activeSubtitleId ? subtitles.findIndex(sub => sub.id === activeSubtitleId) : -1;
  const isFirstSubtitle = currentIndex === 0;
  const isLastSubtitle = currentIndex === subtitles.length - 1;

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

  const navigateToNextSubtitle = () => {
    if (!activeSubtitleId) return;
    const idx = subtitles.findIndex(sub => sub.id === activeSubtitleId);
    if (idx < subtitles.length - 1) {
      const nextSubtitle = subtitles[idx + 1];
      handleSubtitleClick(nextSubtitle);
    }
  };

  const navigateToPrevSubtitle = () => {
    if (!activeSubtitleId) return;
    const idx = subtitles.findIndex(sub => sub.id === activeSubtitleId);
    if (idx > 0) {
      const prevSubtitle = subtitles[idx - 1];
      handleSubtitleClick(prevSubtitle);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full flex bg-zinc-950 overflow-hidden">
      
      {/* 1. Far Left: Navigation/Selector Sidebar */}
      <EditorSidebar 
        activeTab={activeDrawerTab}
        onTabChange={setActiveDrawerTab}
        onNavigatePrev={navigateToPrevSubtitle}
        onNavigateNext={navigateToNextSubtitle}
        canNavigatePrev={!!activeSubtitleId && !isFirstSubtitle}
        canNavigateNext={!!activeSubtitleId && !isLastSubtitle}
      />

      {/* 2. Middle: Video Player Stage (Flex 1) */}
      <div className="flex-1 flex flex-col bg-zinc-900 min-w-0">
        
        {/* Video Display Area */}
        <div className="flex-1 relative bg-black">
          {/* Resolution Dropdown Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <ResolutionDropdown
              selectedResolution={selectedResolution}
              onSelectResolution={handleResolutionChange}
            />
          </div>
          
          <VideoPlayer
            videoUrl={videoUrl}
            currentTime={currentTime}
            subtitles={subtitles}
            videoRef={videoRef}
            onLoadedMetadata={handleLoadedMetadata}
            captionText={activeSubtitle?.text || ''}
            captionStyle={currentStyle}
            resolution={selectedResolution || undefined}
          />

          {/* Center Play/Pause Overlay */}
          {!isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity hover:bg-black/30"
              onClick={togglePlayPause}
            >
              <div className="w-20 h-20 rounded-full bg-lash-900 shadow-2xl shadow-lash-800/50 flex items-center justify-center hover:bg-lash-800 transition-all hover:scale-110">
                <Play className="w-10 h-10 text-white ml-1" fill="white" />
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
              className="p-3 rounded-lg bg-lash-900 hover:bg-lash-800 transition-all hover:scale-105 shadow-lg shadow-lash-800/30"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" fill="white" />
              ) : (
                <Play className="w-6 h-6 text-white" fill="white" />
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
        <div className="h-56 bg-zinc-950 border-t border-zinc-800">
          <Timeline
            currentTime={currentTime}
            duration={duration}
            subtitles={subtitles}
            onSeek={handleSeek}
          />
        </div>
      </div>

      {/* 3. Far Right: Content Drawer (Fixed Width) */}
      <div className="w-[30%] min-w-[320px] flex flex-col">
        <SubtitleDrawer
          activeTab={activeDrawerTab}
          activeSubtitle={activeSubtitle}
          activeSubtitleId={activeSubtitleId}
          subtitles={subtitles}
          transcriptText={transcriptText}
          currentStyle={currentStyle}
          selectedResolution={selectedResolution}
          onTranscriptChange={handleTranscriptChange}
          onStyleChange={handleStyleChange}
          onSaveChanges={handleSaveChanges}
          onSubtitleClick={handleSubtitleClick}
          onResolutionChange={handleResolutionChange}
          formatTime={formatTime}
        />
      </div>

    </div>
  );
};

export default VideoEditor;