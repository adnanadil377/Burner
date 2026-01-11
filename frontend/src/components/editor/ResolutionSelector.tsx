import { Monitor } from 'lucide-react';
import { videoResolutions, resolutionsByPlatform, type VideoResolution } from '../../config/videoResolutions';

interface ResolutionSelectorProps {
  selectedResolution: VideoResolution | null;
  onSelectResolution: (resolution: VideoResolution) => void;
}

const ResolutionSelector = ({ selectedResolution, onSelectResolution }: ResolutionSelectorProps) => {
  const platforms = Object.keys(resolutionsByPlatform);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-700">
        <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
          <Monitor className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Video Resolution</h3>
          <p className="text-sm text-zinc-400">Choose platform format</p>
        </div>
      </div>

      {/* Current Selection Display */}
      {selectedResolution && (
        <div className="p-4 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{selectedResolution.icon}</span>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-1 rounded">
              {selectedResolution.aspectRatio}
            </span>
          </div>
          <p className="text-sm font-medium text-white">{selectedResolution.platform} - {selectedResolution.name}</p>
          <p className="text-xs text-zinc-400 mt-1">{selectedResolution.width} × {selectedResolution.height}px</p>
        </div>
      )}

      {/* Platform Groups */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {platforms.map((platform) => (
          <div key={platform} className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-300 sticky top-0 bg-zinc-900 py-2 z-10">
              {platform}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {resolutionsByPlatform[platform].map((resolution) => (
                <button
                  key={resolution.id}
                  onClick={() => onSelectResolution(resolution)}
                  className={`
                    group relative p-3 rounded-lg text-left transition-all
                    border-2
                    ${
                      selectedResolution?.id === resolution.id
                        ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{resolution.icon}</span>
                        <span className="text-sm font-medium text-white truncate">
                          {resolution.name}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-1">{resolution.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded">
                          {resolution.aspectRatio}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {resolution.width}×{resolution.height}
                        </span>
                      </div>
                    </div>
                    
                    {/* Aspect Ratio Visual Preview */}
                    <div className="flex items-center justify-center w-12 h-12 bg-zinc-900 rounded border border-zinc-700">
                      <div
                        className={`
                          bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-sm
                          ${selectedResolution?.id === resolution.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-60'}
                          transition-opacity
                        `}
                        style={{
                          width: resolution.aspectRatio === '9:16' ? '8px' : 
                                 resolution.aspectRatio === '1:1' ? '20px' :
                                 resolution.aspectRatio === '16:9' ? '32px' :
                                 resolution.aspectRatio === '4:5' ? '16px' :
                                 resolution.aspectRatio === '2:3' ? '12px' : '20px',
                          height: resolution.aspectRatio === '9:16' ? '32px' : 
                                  resolution.aspectRatio === '1:1' ? '20px' :
                                  resolution.aspectRatio === '16:9' ? '18px' :
                                  resolution.aspectRatio === '4:5' ? '20px' :
                                  resolution.aspectRatio === '2:3' ? '18px' : '20px',
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(24, 24, 27);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(63, 63, 70);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(82, 82, 91);
        }
      `}</style>
    </div>
  );
};

export default ResolutionSelector;
