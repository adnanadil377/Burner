import VideoEditor from '../../components/editor/VideoEditor';
import VideoEditorMobile from '../../components/editor/VideoEditorMobile';
import { MOCK_VIDEO_URL, MOCK_SUBTITLES } from '../../data/mock';

/**
 * Video Editor Page
 * 
 * A professional video editing interface with:
 * - Real-time video playback with subtitle overlay
 * - Interactive timeline with scrubbing
 * - Precise subtitle block positioning
 * - Script sidebar for editing subtitles
 * - Style controls for customizing appearance
 */
export default function EditorPage() {
  const handleSubtitlesChange = (updatedSubtitles: any) => {
    console.log('Subtitles updated:', updatedSubtitles);
    // You can add logic here to save to backend
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 ">
      <div className='hidden lg:block'>
        <VideoEditor 
          videoUrl={MOCK_VIDEO_URL}
          subtitles={MOCK_SUBTITLES}
          onSubtitlesChange={handleSubtitlesChange}
        />
      </div>
      <div className='lg:hidden'>
        <VideoEditorMobile 
          videoUrl={MOCK_VIDEO_URL}
          subtitles={MOCK_SUBTITLES}
          onSubtitlesChange={handleSubtitlesChange}
        />
      </div>
    </div>
  );
}
