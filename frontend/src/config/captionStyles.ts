export interface CaptionStyle {
  id: string;
  name: string;
  // Text styling
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  textColor: string;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: 'normal' | 'wide' | 'wider';
  // Background & Effects
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  padding: 'none' | 'sm' | 'md' | 'lg';
  // Shadow & Outline
  textShadow: 'none' | 'sm' | 'md' | 'lg' | 'glow';
  textOutline: boolean;
  // Animation
  animation: 'none' | 'fade' | 'slide-up' | 'bounce' | 'typewriter' | 'word-highlight' | 'scale';
  // Position
  position: 'top' | 'center' | 'bottom';
  horizontalAlign: 'left' | 'center' | 'right';
}

export const captionPresets: CaptionStyle[] = [
  {
    id: 'karaoke',
    name: 'Karaoke',
    fontFamily: 'Montserrat',
    fontSize: 'lg',
    fontWeight: 'bold',
    textColor: '#FCD34D',
    textTransform: 'none',
    letterSpacing: 'normal',
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    borderRadius: 'none',
    padding: 'none',
    textShadow: 'lg',
    textOutline: true,
    animation: 'word-highlight',
    position: 'bottom',
    horizontalAlign: 'center',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    fontFamily: 'Crimson Pro',
    fontSize: 'md',
    fontWeight: 'medium',
    textColor: '#FFFFFF',
    textTransform: 'none',
    letterSpacing: 'normal',
    backgroundColor: '#000000',
    backgroundOpacity: 0.7,
    borderRadius: 'md',
    padding: 'md',
    textShadow: 'none',
    textOutline: false,
    animation: 'fade',
    position: 'bottom',
    horizontalAlign: 'center',
  },
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    fontFamily: 'Bebas Neue',
    fontSize: 'xl',
    fontWeight: 'extrabold',
    textColor: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 'wider',
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    borderRadius: 'none',
    padding: 'none',
    textShadow: 'lg',
    textOutline: true,
    animation: 'scale',
    position: 'center',
    horizontalAlign: 'center',
  },
  {
    id: 'gradient-pop',
    name: 'Gradient Pop',
    fontFamily: 'Montserrat',
    fontSize: 'lg',
    fontWeight: 'bold',
    textColor: '#3B82F6',
    textTransform: 'none',
    letterSpacing: 'normal',
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    borderRadius: 'none',
    padding: 'none',
    textShadow: 'glow',
    textOutline: false,
    animation: 'bounce',
    position: 'bottom',
    horizontalAlign: 'center',
  },
  {
    id: 'news-ticker',
    name: 'News Ticker',
    fontFamily: 'Space Mono',
    fontSize: 'md',
    fontWeight: 'semibold',
    textColor: '#FFFFFF',
    textTransform: 'none',
    letterSpacing: 'wide',
    backgroundColor: '#0EA5E9',
    backgroundOpacity: 0.95,
    borderRadius: 'none',
    padding: 'md',
    textShadow: 'none',
    textOutline: false,
    animation: 'slide-up',
    position: 'bottom',
    horizontalAlign: 'left',
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    fontFamily: 'Montserrat',
    fontSize: 'lg',
    fontWeight: 'bold',
    textColor: '#A21CAF',
    textTransform: 'none',
    letterSpacing: 'normal',
    backgroundColor: 'transparent',
    backgroundOpacity: 0,
    borderRadius: 'none',
    padding: 'none',
    textShadow: 'glow',
    textOutline: false,
    animation: 'fade',
    position: 'bottom',
    horizontalAlign: 'center',
  },
];

export const fontSizeMap = {
  sm: 24,
  md: 32,
  lg: 42,
  xl: 52,
};

export const fontWeightMap = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const letterSpacingMap = {
  normal: '0',
  wide: '0.05em',
  wider: '0.1em',
};

export const borderRadiusMap = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

export const paddingMap = {
  none: { x: 0, y: 0 },
  sm: { x: 8, y: 4 },
  md: { x: 16, y: 8 },
  lg: { x: 24, y: 12 },
};

export const textShadowStyles = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 2px 4px rgba(0, 0, 0, 0.4)',
  lg: `
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    0 2px 8px rgba(0, 0, 0, 0.8)
  `,
  glow: '0 0 20px currentColor, 0 0 40px currentColor',
};

export const positionMap = {
  top: { top: '10%' },
  center: { top: '50%', transform: 'translateY(-50%)' },
  bottom: { bottom: '15%' },
};

export const horizontalAlignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};
