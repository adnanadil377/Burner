import { useState } from 'react';
import { ChevronLeft, ChevronRight, Type, Palette, Layout, Box, Check, Sparkles, Clock } from 'lucide-react';
import type { Subtitle } from '../../data/mock';
import { captionPresets, type CaptionStyle } from '../../config/captionStyles';
import CaptionTimeline from './CaptionTimeline';

type DrawerTab = 'text' | 'presets' | 'style' | 'position' | 'animation' | 'timeline';

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

// PresetStyleTab component
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
  activeSubtitle: Subtitle | undefined;
  activeSubtitleId: string | null;
  subtitles: Subtitle[];
  transcriptText: string;
  currentStyle: CaptionStyle;
  onTranscriptChange: (text: string) => void;
  onStyleChange: (style: CaptionStyle) => void;
  onSaveChanges: () => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onSubtitleClick?: (subtitle: Subtitle) => void;
  formatTime: (seconds: number) => string;
}

export default function SubtitleDrawer({
  activeSubtitle,
  activeSubtitleId,
  subtitles,
  transcriptText,
  currentStyle,
  onTranscriptChange,
  onStyleChange,
  onSaveChanges,
  onNavigatePrev,
  onNavigateNext,
  onSubtitleClick,
  formatTime,
}: SubtitleDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('text');

  const currentIndex = activeSubtitleId ? subtitles.findIndex(sub => sub.id === activeSubtitleId) : -1;
  const isFirstSubtitle = currentIndex === 0;
  const isLastSubtitle = currentIndex === subtitles.length - 1;

  const handleSubtitleClickFromTimeline = (subtitle: Subtitle) => {
    if (onSubtitleClick) {
      onSubtitleClick(subtitle);
    }
  };

  return (
    <div className="h-full flex">
      {/* Left: Tab Selector */}
      <div className="w-16 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-6 gap-3">
        <button
          onClick={() => setActiveTab('text')}
          className={`p-3 rounded-lg transition-all ${
            activeTab === 'text'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Text"
        >
          <Type className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setActiveTab('presets')}
          className={`p-3 rounded-lg transition-all ${
            activeTab === 'presets'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Presets"
        >
          <Sparkles className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setActiveTab('style')}
          className={`p-3 rounded-lg transition-all ${
            activeTab === 'style'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Style"
        >
          <Palette className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setActiveTab('position')}
          className={`p-3 rounded-lg transition-all ${
            activeTab === 'position'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Position"
        >
          <Layout className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setActiveTab('animation')}
          className={`p-3 rounded-lg transition-all ${
            activeTab === 'animation'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Animation"
        >
          <Box className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setActiveTab('timeline')}
          className={`p-3 rounded-lg transition-all ${
            activeTab === 'timeline'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Timeline"
        >
          <Clock className="w-5 h-5" />
        </button>

        {/* Navigation Controls */}
        <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-zinc-800">
          <button
            onClick={onNavigatePrev}
            disabled={!activeSubtitleId || isFirstSubtitle}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous subtitle"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNavigateNext}
            disabled={!activeSubtitleId || isLastSubtitle}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next subtitle"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right: Content Area */}
      <div className="flex-1 flex flex-col bg-zinc-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="flex flex-col gap-1">
            {activeSubtitle && activeTab !== 'timeline' && (
              <>
                <span className="text-sm font-mono text-zinc-400">
                  {formatTime(activeSubtitle.start)} - {formatTime(activeSubtitle.end)}
                </span>
                <span className="text-sm text-white font-medium truncate">
                  {activeSubtitle.text}
                </span>
              </>
            )}
            {!activeSubtitle && activeTab !== 'timeline' && (
              <span className="text-sm text-zinc-500">No subtitle selected</span>
            )}
            {activeTab === 'timeline' && (
              <span className="text-lg font-semibold text-white">Caption Timeline</span>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
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
                  <label className="text-sm text-zinc-400 mb-2 block">Subtitle Text</label>
                  <textarea
                    value={transcriptText}
                    onChange={(e) => onTranscriptChange(e.target.value)}
                    placeholder="Edit subtitle text..."
                    className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Start Time</label>
                    <input
                      type="text"
                      value={activeSubtitle ? formatTime(activeSubtitle.start) : '00:00'}
                      readOnly
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">End Time</label>
                    <input
                      type="text"
                      value={activeSubtitle ? formatTime(activeSubtitle.end) : '00:00'}
                      readOnly
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white font-mono focus:outline-none"
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
                  <label className="text-sm font-medium text-zinc-400">Font Family</label>
                  <div className="grid grid-cols-2 gap-2">
                    {fontOptions.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => onStyleChange({ ...currentStyle, fontFamily: font.value })}
                        className={`py-3 px-4 text-sm rounded-lg border-2 transition-all ${
                          currentStyle.fontFamily === font.value
                            ? 'border-amber-500 bg-amber-500/10 text-white'
                            : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
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
                  <label className="text-sm font-medium text-zinc-400">Font Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => onStyleChange({ ...currentStyle, fontSize: size })}
                        className={`py-3 text-sm uppercase rounded-lg border-2 transition-all font-semibold ${
                          currentStyle.fontSize === size
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Weight */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Font Weight</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['normal', 'medium', 'bold', 'extrabold'] as const).map((weight) => (
                      <button
                        key={weight}
                        onClick={() => onStyleChange({ ...currentStyle, fontWeight: weight })}
                        className={`py-3 text-sm rounded-lg border-2 transition-all capitalize ${
                          currentStyle.fontWeight === weight
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
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
                  <label className="text-sm font-medium text-zinc-400">Text Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {colorSwatches.map((color) => (
                      <button
                        key={color}
                        onClick={() => onStyleChange({ ...currentStyle, textColor: color })}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          currentStyle.textColor === color
                            ? 'border-amber-500 ring-2 ring-amber-500/30 scale-110'
                            : 'border-zinc-700 hover:border-zinc-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Background Opacity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-400">Background Opacity</label>
                    <span className="text-sm font-mono text-amber-400">{Math.round(currentStyle.backgroundOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={currentStyle.backgroundOpacity * 100}
                    onChange={(e) => onStyleChange({ ...currentStyle, backgroundOpacity: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Text Effects */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Text Effects</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onStyleChange({ ...currentStyle, textOutline: !currentStyle.textOutline })}
                      className={`py-3 text-sm rounded-lg border-2 transition-all font-medium ${
                        currentStyle.textOutline
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      Outline
                    </button>
                    <button
                      onClick={() => onStyleChange({ ...currentStyle, textTransform: currentStyle.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                      className={`py-3 text-sm rounded-lg border-2 transition-all font-medium ${
                        currentStyle.textTransform === 'uppercase'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      UPPERCASE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'position' && (
              <div className="space-y-5">
                {/* Vertical Position */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Vertical Position</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => onStyleChange({ ...currentStyle, position: pos })}
                        className={`py-3 rounded-lg text-sm font-medium transition-all capitalize ${
                          currentStyle.position === pos
                            ? 'bg-amber-500 text-black border-2 border-amber-500'
                            : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horizontal Alignment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Horizontal Alignment</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => onStyleChange({ ...currentStyle, horizontalAlign: align })}
                        className={`py-3 rounded-lg text-sm font-medium transition-all capitalize ${
                          currentStyle.horizontalAlign === align
                            ? 'bg-amber-500 text-black border-2 border-amber-500'
                            : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Padding */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Padding</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['none', 'sm', 'md', 'lg'] as const).map((pad) => (
                      <button
                        key={pad}
                        onClick={() => onStyleChange({ ...currentStyle, padding: pad })}
                        className={`py-3 text-sm uppercase rounded-lg border-2 transition-all font-medium ${
                          currentStyle.padding === pad
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {pad}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Corner Radius</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
                      <button
                        key={radius}
                        onClick={() => onStyleChange({ ...currentStyle, borderRadius: radius })}
                        className={`py-3 text-xs uppercase rounded-lg border-2 transition-all font-medium ${
                          currentStyle.borderRadius === radius
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300'
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
                <div className="grid grid-cols-3 gap-3">
                  {animationOptions.map((anim) => (
                    <button
                      key={anim.value}
                      onClick={() => onStyleChange({ ...currentStyle, animation: anim.value })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        currentStyle.animation === anim.value
                          ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                          : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="text-2xl mb-2">{anim.icon}</div>
                      <div className="text-sm text-zinc-400">{anim.label}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl text-center">
                  <p className="text-sm text-zinc-400">Animations will be applied during playback</p>
                </div>
              </div>
            )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {activeTab !== 'timeline' && (
          <div className="px-6 py-4 border-t border-zinc-800">
            <button
              onClick={onSaveChanges}
              disabled={!activeSubtitleId}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                activeSubtitleId
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 hover:scale-[1.02]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              Apply Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
