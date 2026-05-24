import { ChevronLeft, ChevronRight, Type, Palette, Layout, Box, Check, Sparkles, Clock, Monitor } from 'lucide-react';
import type { Subtitle } from '../../data/mock';
import { captionPresets, type CaptionStyle } from '../../config/captionStyles';
import CaptionTimeline from './CaptionTimeline';
import ResolutionSelector from './ResolutionSelector';
import type { VideoResolution } from '../../config/videoResolutions';

// Export this type so VideoEditor can use it
export type DrawerTab = 'timeline' | 'text' | 'presets' | 'style' | 'position' | 'animation' | 'resolution';

const fontOptions = [
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Crimson Pro', label: 'Crimson Pro' },
  { value: 'Space Mono', label: 'Space Mono' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
];

const colorSwatches = [
  '#FFFFFF',
  '#FCD34D',
  '#3B82F6',
  '#EF4444',
  '#A21CAF',
  '#10B981',
  '#F97316',
  '#000000',
];

const animationOptions = [
  { value: 'none', label: 'None', icon: '—' },
  { value: 'fade', label: 'Fade', icon: '◐' },
  { value: 'slide-up', label: 'Slide Up', icon: '↑' },
  { value: 'bounce', label: 'Bounce', icon: '◎' },
  { value: 'scale', label: 'Scale', icon: '⊕' },
  { value: 'word-highlight', label: 'Highlight', icon: '▮' },
] as const;

// PresetStyleTab component (Unchanged)
function PresetStyleTab({ currentStyle, onStyleChange }: {
  currentStyle: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-zinc-400 mb-3 block font-medium">Style Presets</label>
        <div className="grid grid-cols-3 gap-3">
          {captionPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onStyleChange(preset)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-500/50
                ${currentStyle.id === preset.id 
                  ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/20' 
                  : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600'
                }
              `}
            >
              {currentStyle.id === preset.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-black" strokeWidth={3} />
                </div>
              )}
              <div 
                className="text-2xl font-bold mb-2 transition-transform"
                style={{ 
                  color: preset.textColor,
                  fontFamily: preset.fontFamily
                }}
              >
                Aa
              </div>
              <div className={`text-xs font-medium ${
                currentStyle.id === preset.id ? 'text-amber-400' : 'text-zinc-400'
              }`}>
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SubtitleDrawerProps {
  activeTab: DrawerTab; // New prop
  activeSubtitle: Subtitle | undefined;
  activeSubtitleId: string | null;
  subtitles: Subtitle[];
  transcriptText: string;
  currentStyle: CaptionStyle;
  selectedResolution: VideoResolution | null;
  onTranscriptChange: (text: string) => void;
  onStyleChange: (style: CaptionStyle) => void;
  onSaveChanges: () => void;
  onSubtitleClick?: (subtitle: Subtitle) => void;
  onResolutionChange: (resolution: VideoResolution) => void;
  formatTime: (seconds: number) => string;
}

export default function SubtitleDrawer({
  activeTab,
  activeSubtitle,
  activeSubtitleId,
  subtitles,
  transcriptText,
  currentStyle,
  selectedResolution,
  onTranscriptChange,
  onStyleChange,
  onSaveChanges,
  onSubtitleClick,
  onResolutionChange,
  formatTime,
}: SubtitleDrawerProps) {
  
  // Note: activeTab state and Navigation logic moved to VideoEditor/Sidebar

  const currentIndex = activeSubtitleId ? subtitles.findIndex(sub => sub.id === activeSubtitleId) : -1;

  const handleSubtitleClickFromTimeline = (subtitle: Subtitle) => {
    if (onSubtitleClick) {
      onSubtitleClick(subtitle);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex-shrink-0">
        <div className="flex flex-col gap-1">
          {activeSubtitle && activeTab !== 'timeline' && (
            <>
              <span className="text-[10px] font-mono text-zinc-500">
                {formatTime(activeSubtitle.start)} - {formatTime(activeSubtitle.end)}
              </span>
              <span className="text-sm text-white truncate">
                {activeSubtitle.text}
              </span>
            </>
          )}
          {!activeSubtitle && activeTab !== 'timeline' && (
            <span className="text-sm text-zinc-600">No subtitle selected</span>
          )}
          {activeTab === 'timeline' && (
            <span className="text-base font-medium text-white">Caption Timeline</span>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'timeline' ? (
          <CaptionTimeline
            subtitles={subtitles}
            activeSubtitleId={activeSubtitleId}
            onSubtitleClick={handleSubtitleClickFromTimeline}
            formatTime={formatTime}
          />
        ) : (
          <div className="p-6">
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Subtitle Text</label>
                <textarea
                  value={transcriptText}
                  onChange={(e) => onTranscriptChange(e.target.value)}
                  placeholder="Edit subtitle text..."
                  className="w-full h-32 bg-[#0a0a0f] border border-white/5 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Start Time</label>
                  <input
                    type="text"
                    value={activeSubtitle ? formatTime(activeSubtitle.start) : '00:00'}
                    readOnly
                    className="w-full bg-[#1A1A28] border border-white/5 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">End Time</label>
                  <input
                    type="text"
                    value={activeSubtitle ? formatTime(activeSubtitle.end) : '00:00'}
                    readOnly
                    className="w-full bg-[#1A1A28] border border-white/5 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <PresetStyleTab
              currentStyle={currentStyle}
              onStyleChange={onStyleChange}
            />
          )}

          {activeTab === 'style' && (
            <div className="space-y-5">
              {/* Font Family */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Font Family</label>
                <div className="grid grid-cols-2 gap-2">
                  {fontOptions.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => onStyleChange({ ...currentStyle, fontFamily: font.value })}
                      className={`py-2 px-3 text-xs rounded-lg border transition-all ${
                        currentStyle.fontFamily === font.value
                          ? 'border-purple-500/50 bg-purple-500/10 text-white'
                          : 'border-white/5 bg-[#1A1A28]/50 hover:bg-[#1A1A28] text-gray-400'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Font Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => onStyleChange({ ...currentStyle, fontSize: size })}
                      className={`py-2 text-xs uppercase rounded-lg border transition-all ${
                        currentStyle.fontSize === size
                          ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                          : 'border-white/5 bg-[#1A1A28]/50 hover:bg-[#1A1A28] text-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Weight */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Font Weight</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['normal', 'medium', 'bold', 'extrabold'] as const).map((weight) => (
                    <button
                      key={weight}
                      onClick={() => onStyleChange({ ...currentStyle, fontWeight: weight })}
                      className={`py-2 text-xs rounded-lg border transition-all capitalize ${
                        currentStyle.fontWeight === weight
                          ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                          : 'border-white/5 bg-[#1A1A28]/50 hover:bg-[#1A1A28] text-gray-400'
                      }`}
                      style={{ fontWeight: weight === 'extrabold' ? 800 : weight }}
                    >
                      {weight === 'extrabold' ? 'xbold' : weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Text Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorSwatches.map((color) => (
                    <button
                      key={color}
                      onClick={() => onStyleChange({ ...currentStyle, textColor: color })}
                      className={`w-8 h-8 rounded-lg border transition-all ${
                        currentStyle.textColor === color
                          ? 'border-purple-500 ring-1 ring-purple-500/30'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Background Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">Background Opacity</label>
                  <span className="text-xs font-mono text-purple-400">{Math.round(currentStyle.backgroundOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={currentStyle.backgroundOpacity * 100}
                  onChange={(e) => onStyleChange({ ...currentStyle, backgroundOpacity: parseInt(e.target.value) / 100 })}
                  className="w-full h-1.5 bg-[#1A1A28] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Text Effects */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Text Effects</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onStyleChange({ ...currentStyle, textOutline: !currentStyle.textOutline })}
                    className={`py-2 text-xs rounded-lg border transition-all ${
                      currentStyle.textOutline
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                        : 'border-white/5 bg-[#1A1A28]/50 hover:bg-[#1A1A28] text-gray-400'
                    }`}
                  >
                    Outline
                  </button>
                  <button
                    onClick={() => onStyleChange({ ...currentStyle, textTransform: currentStyle.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                    className={`py-2 text-xs rounded-lg border transition-all ${
                      currentStyle.textTransform === 'uppercase'
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                        : 'border-white/5 bg-[#1A1A28]/50 hover:bg-[#1A1A28] text-gray-400'
                    }`}
                  >
                    UPPERCASE
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'position' && (
            <div className="space-y-4">
              {/* Vertical Position */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Vertical Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => onStyleChange({ ...currentStyle, position: pos })}
                      className={`py-2 rounded-lg text-xs transition-all capitalize ${
                        currentStyle.position === pos
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : 'bg-[#1A1A28]/50 hover:bg-[#1A1A28] border border-white/5 text-gray-400'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horizontal Alignment */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Horizontal Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => onStyleChange({ ...currentStyle, horizontalAlign: align })}
                      className={`py-2 rounded-lg text-xs transition-all capitalize ${
                        currentStyle.horizontalAlign === align
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : 'bg-[#1A1A28]/50 hover:bg-[#1A1A28] border border-white/5 text-gray-400'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Padding */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Padding</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'sm', 'md', 'lg'] as const).map((pad) => (
                    <button
                      key={pad}
                      onClick={() => onStyleChange({ ...currentStyle, padding: pad })}
                      className={`py-2 text-xs uppercase rounded-lg border transition-all ${
                        currentStyle.padding === pad
                          ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                          : 'border-white/5 bg-[#1A1A28]/50 hover:bg-[#1A1A28] text-gray-400'
                      }`}
                    >
                      {pad}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Corner Radius</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
                    <button
                      key={radius}
                      onClick={() => onStyleChange({ ...currentStyle, borderRadius: radius })}
                      className={`py-2 text-[10px] uppercase rounded-lg border transition-all ${
                        currentStyle.borderRadius === radius
                          ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                          : 'border-white/5 bg-[#1A1A28]/50 hover:bg-[#1A1A28] text-gray-400'
                      }`}
                    >
                      {radius}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'animation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {animationOptions.map((anim) => (
                  <button
                    key={anim.value}
                    onClick={() => onStyleChange({ ...currentStyle, animation: anim.value })}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      currentStyle.animation === anim.value
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-white/5 bg-[#1A1A28]/50 hover:bg-[#1A1A28]'
                    }`}
                  >
                    <div className="text-xl mb-1">{anim.icon}</div>
                    <div className="text-[10px] text-gray-500">{anim.label}</div>
                  </button>
                ))}
              </div>
              <div className="p-3 bg-[#1A1A28]/50 rounded-lg text-center">
                <p className="text-xs text-gray-600">Applied during playback</p>
              </div>
            </div>
          )}

          {activeTab === 'resolution' && (
            <ResolutionSelector
              selectedResolution={selectedResolution}
              onSelectResolution={onResolutionChange}
            />
          )}
          </div>
        )}
      </div>
    </div>
  );
}