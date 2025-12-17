// Mock data for the Video Timeline Editor

export const MOCK_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
}

export const MOCK_SUBTITLES: Subtitle[] = [
  {
    id: "sub-1",
    start: 0.5,
    end: 2.5,
    text: "Welcome to the Video Editor"
  },
  {
    id: "sub-2",
    start: 3.0,
    end: 5.0,
    text: "Edit your videos with precision"
  },
  {
    id: "sub-3",
    start: 5.5,
    end: 7.5,
    text: "Add stunning captions"
  },
  {
    id: "sub-4",
    start: 8.0,
    end: 9.5,
    text: "Create professional content"
  },
  {
    id: "sub-5",
    start: 10.0,
    end: 12.0,
    text: "Share with the world"
  }
];
