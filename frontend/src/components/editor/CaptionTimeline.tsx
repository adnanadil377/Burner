import { useState } from 'react';
import type { Subtitle } from '../../data/mock';

interface CaptionTimelineProps {
  subtitles: Subtitle[];
  activeSubtitleId: string | null;
  onSubtitleClick: (subtitle: Subtitle) => void;
  onSubtitleUpdate?: (subtitleId: string, newText: string) => void;
  formatTime: (seconds: number) => string;
}

export default function CaptionTimeline({
  subtitles,
  activeSubtitleId,
  onSubtitleClick,
  onSubtitleUpdate,
  formatTime,
}: CaptionTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const handleEditClick = (subtitle: Subtitle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(subtitle.id);
    setEditText(subtitle.text);
  };

  const handleSaveEdit = (subtitleId: string) => {
    if (onSubtitleUpdate && editText.trim()) {
      onSubtitleUpdate(subtitleId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, subtitleId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(subtitleId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-2 border-zinc-800">
        <p className="text-sm text-zinc-400 mt-1">Click on any caption to navigate or edit icon to edit</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {subtitles.map((subtitle) => {
            const isActive = subtitle.id === activeSubtitleId;
            const isEditing = editingId === subtitle.id;

            return (
              <div
                key={subtitle.id}
                onClick={() => !isEditing && onSubtitleClick(subtitle)}
                className={`group relative p-4 rounded-xl transition-all duration-200 ${
                  isEditing
                    ? 'bg-zinc-800 shadow-xl shadow-purple-500/10'
                    : isActive
                      ? 'bg-lash-800 shadow-sm border border-lash-900 shadow-purple-500/30 scale-[1.02] cursor-pointer'
                      : 'bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:scale-[1.01] cursor-pointer'
                }`}
              >
                {/* Timeline indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-x overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isEditing ? 'bg-purple-500' : 'bg-purple-500/0 group-hover:bg-purple-500/50'
                    }`}
                  />
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-semibold ${
                      isEditing ? 'text-purple-400' : 'text-zinc-500 group-hover:text-purple-400'
                    }`}>
                      {formatTime(subtitle.start)}
                    </span>
                    <span className="text-xs text-zinc-600">
                      →
                    </span>
                    <span className={`text-xs font-mono ${
                      isEditing ? 'text-purple-400' : 'text-zinc-600 group-hover:text-purple-400'
                    }`}>
                      {formatTime(subtitle.end)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && !isEditing && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-purple-500/70 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-purple-400">Playing</span>
                      </div>
                    )}
                    {!isEditing ? (
                      <button
                        onClick={(e) => handleEditClick(subtitle, e)}
                        className='p-1.5 rounded-lg transition-all duration-200 hover:bg-purple-500/10 text-zinc-500 hover:text-purple-400 opacity-0 group-hover:opacity-100'
                        title="Edit caption"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSaveEdit(subtitle.id)}
                          className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-600/30 text-white transition-all"
                          title="Save (Enter)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-all"
                          title="Cancel (Esc)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, subtitle.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-zinc-900 text-zinc-100 text-sm leading-relaxed px-3 py-2 rounded-lg border border-zinc-700 focus:border-purple-500 focus:outline-none resize-none"
                    rows={3}
                    autoFocus
                    placeholder="Enter caption text..."
                  />
                ) : (
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(subtitle, e);
                    }}
                    className="text-sm leading-relaxed cursor-text text-zinc-300 group-hover:text-purple-100"
                  >
                    {subtitle.text}
                  </p>
                )}

                {/* Duration badge */}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                    isEditing
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-zinc-700/50 text-zinc-400 group-hover:bg-purple-500/10 group-hover:text-purple-400'
                  }`}>
                    {((subtitle.end - subtitle.start).toFixed(1))}s
                  </span>
                  {isEditing && (
                    <span className="text-xs text-zinc-500">
                      Press Enter to save • Esc to cancel
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
