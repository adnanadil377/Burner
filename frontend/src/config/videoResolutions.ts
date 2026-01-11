export interface VideoResolution {
  id: string;
  name: string;
  platform: string;
  aspectRatio: string;
  width: number;
  height: number;
  description: string;
  icon: string;
}

export const videoResolutions: VideoResolution[] = [
  // TikTok
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Vertical video for TikTok',
    icon: '🎵'
  },
  
  // Instagram
  {
    id: 'instagram-reels',
    name: 'Reels',
    platform: 'Instagram',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Instagram Reels vertical',
    icon: '📱'
  },
  {
    id: 'instagram-stories',
    name: 'Stories',
    platform: 'Instagram',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Instagram Stories vertical',
    icon: '📖'
  },
  {
    id: 'instagram-feed-square',
    name: 'Feed (Square)',
    platform: 'Instagram',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    description: 'Square feed post',
    icon: '⬛'
  },
  {
    id: 'instagram-feed-portrait',
    name: 'Feed (Portrait)',
    platform: 'Instagram',
    aspectRatio: '4:5',
    width: 1080,
    height: 1350,
    description: 'Portrait feed post',
    icon: '🖼️'
  },
  
  // YouTube
  {
    id: 'youtube-shorts',
    name: 'Shorts',
    platform: 'YouTube',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    description: 'YouTube Shorts vertical',
    icon: '🎬'
  },
  {
    id: 'youtube-standard',
    name: 'Standard',
    platform: 'YouTube',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    description: 'Standard YouTube video',
    icon: '📺'
  },
  
  // Facebook
  {
    id: 'facebook-stories',
    name: 'Stories',
    platform: 'Facebook',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Facebook Stories',
    icon: '👥'
  },
  {
    id: 'facebook-feed',
    name: 'Feed',
    platform: 'Facebook',
    aspectRatio: '16:9',
    width: 1280,
    height: 720,
    description: 'Facebook feed video',
    icon: '📰'
  },
  
  // Twitter/X
  {
    id: 'twitter-landscape',
    name: 'Landscape',
    platform: 'Twitter/X',
    aspectRatio: '16:9',
    width: 1280,
    height: 720,
    description: 'Twitter landscape video',
    icon: '🐦'
  },
  {
    id: 'twitter-square',
    name: 'Square',
    platform: 'Twitter/X',
    aspectRatio: '1:1',
    width: 720,
    height: 720,
    description: 'Twitter square video',
    icon: '⬜'
  },
  
  // Snapchat
  {
    id: 'snapchat',
    name: 'Snapchat',
    platform: 'Snapchat',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Snapchat vertical video',
    icon: '👻'
  },
  
  // LinkedIn
  {
    id: 'linkedin',
    name: 'LinkedIn',
    platform: 'LinkedIn',
    aspectRatio: '16:9',
    width: 1280,
    height: 720,
    description: 'LinkedIn video post',
    icon: '💼'
  },
  
  // Pinterest
  {
    id: 'pinterest',
    name: 'Pinterest',
    platform: 'Pinterest',
    aspectRatio: '2:3',
    width: 1000,
    height: 1500,
    description: 'Pinterest Pin video',
    icon: '📌'
  },
];

// Group resolutions by platform
export const resolutionsByPlatform = videoResolutions.reduce((acc, resolution) => {
  if (!acc[resolution.platform]) {
    acc[resolution.platform] = [];
  }
  acc[resolution.platform].push(resolution);
  return acc;
}, {} as Record<string, VideoResolution[]>);

// Helper to get aspect ratio as decimal
export const getAspectRatioDecimal = (aspectRatio: string): number => {
  const [width, height] = aspectRatio.split(':').map(Number);
  return width / height;
};

// Helper to calculate dimensions maintaining aspect ratio
export const calculateDimensions = (
  resolution: VideoResolution,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = getAspectRatioDecimal(resolution.aspectRatio);
  
  let width = maxWidth;
  let height = width / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};
