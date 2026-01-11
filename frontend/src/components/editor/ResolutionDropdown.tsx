import { Monitor, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { videoResolutions, resolutionsByPlatform, type VideoResolution } from '../../config/videoResolutions';

interface ResolutionDropdownProps {
  selectedResolution: VideoResolution | null;
  onSelectResolution: (resolution: VideoResolution | null) => void;
}

const ResolutionDropdown = ({ selectedResolution, onSelectResolution }: ResolutionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const platforms = Object.keys(resolutionsByPlatform);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-all text-white shadow-lg"
      >
        <Monitor className="w-4 h-4" />
        <span className="text-sm font-medium">
          {selectedResolution 
            ? `${selectedResolution.platform} ${selectedResolution.name}` 
            : 'Original Size'}
        </span>
        {selectedResolution && (
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded">
            {selectedResolution.aspectRatio}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 max-h-[60vh] overflow-hidden flex flex-col">
          {/* Reset Option */}
          <button
            onClick={() => {
              onSelectResolution(null);
              setIsOpen(false);
            }}
            className={`
              px-4 py-3 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800
              ${!selectedResolution ? 'bg-violet-500/10 text-violet-400' : 'text-white'}
            `}
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <span className="text-sm font-medium">Original Size</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">No cropping applied</p>
          </button>

          {/* Scrollable Platform List */}
          <div className="overflow-y-auto custom-scrollbar">
            {platforms.map((platform) => (
              <div key={platform} className="border-b border-zinc-800 last:border-b-0">
                <div className="px-4 py-2 bg-zinc-950/50 sticky top-0 z-10">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {platform}
                  </h4>
                </div>
                <div>
                  {resolutionsByPlatform[platform].map((resolution) => (
                    <button
                      key={resolution.id}
                      onClick={() => {
                        onSelectResolution(resolution);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full px-4 py-2.5 text-left hover:bg-zinc-800 transition-colors
                        ${selectedResolution?.id === resolution.id ? 'bg-violet-500/10' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{resolution.icon}</span>
                            <span className={`text-sm font-medium truncate ${
                              selectedResolution?.id === resolution.id ? 'text-violet-400' : 'text-white'
                            }`}>
                              {resolution.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded">
                              {resolution.aspectRatio}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {resolution.width}×{resolution.height}
                            </span>
                          </div>
                        </div>
                        
                        {/* Mini aspect ratio preview */}
                        <div className="flex items-center justify-center w-8 h-8 bg-zinc-950 rounded border border-zinc-800">
                          <div
                            className={`
                              bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-sm
                              ${selectedResolution?.id === resolution.id ? 'opacity-100' : 'opacity-40'}
                            `}
                            style={{
                              width: resolution.aspectRatio === '9:16' ? '6px' : 
                                     resolution.aspectRatio === '1:1' ? '14px' :
                                     resolution.aspectRatio === '16:9' ? '20px' :
                                     resolution.aspectRatio === '4:5' ? '11px' :
                                     resolution.aspectRatio === '2:3' ? '9px' : '14px',
                              height: resolution.aspectRatio === '9:16' ? '20px' : 
                                      resolution.aspectRatio === '1:1' ? '14px' :
                                      resolution.aspectRatio === '16:9' ? '11px' :
                                      resolution.aspectRatio === '4:5' ? '14px' :
                                      resolution.aspectRatio === '2:3' ? '14px' : '14px',
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(24, 24, 27);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(63, 63, 70);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(82, 82, 91);
        }
      `}</style>
    </div>
  );
};

export default ResolutionDropdown;
