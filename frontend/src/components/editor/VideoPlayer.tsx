import { type RefObject } from 'react';
import type { Subtitle } from '../../data/mock';
import { 
  type CaptionStyle, 
  fontSizeMap, 
  fontWeightMap, 
  letterSpacingMap, 
  borderRadiusMap, 
  paddingMap, 
  textShadowStyles, 
  positionMap, 
  horizontalAlignMap 
} from '../../config/captionStyles';
import type { VideoResolution } from '../../config/videoResolutions';

interface VideoPlayerProps {
  videoUrl: string;
  currentTime: number;
  subtitles: Subtitle[];
  videoRef: RefObject<HTMLVideoElement | null>;
  onLoadedMetadata: () => void;
  captionText: string;
  captionStyle: CaptionStyle;
  resolution?: VideoResolution;
}

const VideoPlayer = ({
  videoUrl,
  currentTime,
  subtitles,
  videoRef,
  onLoadedMetadata,
  captionText,
  captionStyle,
  resolution
}: VideoPlayerProps) => {
  const padding = paddingMap[captionStyle.padding];
  const textTransform = captionStyle.textTransform;
  
  // Helper to get text color style (supports gradient)
  const getTextColorStyle = () => {
    if (captionStyle.textColor === 'gradient') {
      return {
        backgroundImage: 'linear-gradient(90deg, #3B82F6, #F97316)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    }
    return { color: captionStyle.textColor };
  };

  // Helper to convert hex to rgba for background
  const hexToRgba = (hex: string, opacity: number) => {
    if (hex === 'transparent' || opacity === 0) return 'transparent';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Helper to get text shadow and outline effects
  const getTextEffects = () => {
    const effects: any = {};
    
    // Text outline
    if (captionStyle.textOutline) {
      effects.textShadow = `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 -2px 0 #000, 0 2px 0 #000, -2px 0 0 #000, 2px 0 0 #000`;
    }
    // Text shadow/glow
    else if (captionStyle.textShadow === 'glow') {
      const glowColor = captionStyle.textColor === 'gradient' ? '#3B82F6' : captionStyle.textColor;
      effects.textShadow = `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px ${glowColor}`;
      effects.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.3))';
    } else if (captionStyle.textShadow !== 'none') {
      effects.textShadow = textShadowStyles[captionStyle.textShadow];
    }
    
    return effects;
  };
  
  // Calculate video container dimensions and apply cropping
  const getContainerStyle = () => {
    if (!resolution) {
      return { width: '100%', height: '100%' };
    }
    
    const [widthRatio, heightRatio] = resolution.aspectRatio.split(':').map(Number);
    const aspectRatio = widthRatio / heightRatio;
    
    // Determine if it's portrait or landscape
    if (aspectRatio < 1) {
      // Portrait (e.g., 9:16) - constrain by height
      return {
        width: `${aspectRatio * 70}vh`,
        height: '70vh',
        aspectRatio: `${widthRatio} / ${heightRatio}`,
      };
    } else if (aspectRatio > 1) {
      // Landscape (e.g., 16:9) - constrain by width
      return {
        width: '80vw',
        height: `${(1 / aspectRatio) * 80}vw`,
        aspectRatio: `${widthRatio} / ${heightRatio}`,
        maxHeight: '70vh',
      };
    } else {
      // Square (1:1)
      return {
        width: 'min(70vh, 50vw)',
        height: 'min(70vh, 50vw)',
        aspectRatio: '1 / 1',
      };
    }
  };
  
  return (
    <div className="relative w-full h-full flex items-center bg-black justify-center overflow-hidden">
      {/* Video Container with aspect ratio */}
      <div 
        className="relative bg-black border-8 border-black overflow-hidden flex-shrink-0"
        style={getContainerStyle()}
      >
        {/* Video Element - will be cropped to fit container */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedMetadata={onLoadedMetadata}
          preload="metadata"
        />

        {/* Subtitle Overlay - positioned within the cropped video container */}
        {captionText && (
          <div 
            className="absolute inset-0 flex pointer-events-none transition-all duration-300"
            style={{
              ...positionMap[captionStyle.position],
              justifyContent: horizontalAlignMap[captionStyle.horizontalAlign],
              textAlign: captionStyle.horizontalAlign,
              paddingLeft: resolution ? '1rem' : '2rem',
              paddingRight: resolution ? '1rem' : '2rem'
            }}
          >
            <div 
              style={{
                backgroundColor: hexToRgba(captionStyle.backgroundColor, captionStyle.backgroundOpacity),
                borderRadius: borderRadiusMap[captionStyle.borderRadius],
                paddingLeft: `${padding.x}px`,
                paddingRight: `${padding.x}px`,
                paddingTop: `${padding.y}px`,
                paddingBottom: `${padding.y}px`,
              }}
            >
              <p 
                style={{
                  fontFamily: captionStyle.fontFamily,
                  fontSize: `${fontSizeMap[captionStyle.fontSize]}px`,
                  fontWeight: fontWeightMap[captionStyle.fontWeight],
                  letterSpacing: letterSpacingMap[captionStyle.letterSpacing],
                  textTransform: textTransform,
                  lineHeight: '1.2',
                  margin: 0,
                  maxWidth: '900px',
                  ...getTextColorStyle(),
                  ...getTextEffects(),
                }}
              >
                {captionText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
