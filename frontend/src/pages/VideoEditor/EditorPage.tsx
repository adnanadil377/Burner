import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import VideoEditor from '../../components/editor/VideoEditor';
import VideoEditorMobile from '../../components/editor/VideoEditorMobile';
import { MOCK_SUBTITLES } from '../../data/mock';
import { api, type Subtitle } from '../../services/api';

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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const videoId = searchParams.get('videoId');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [transcriptionStatus, setTranscriptionStatus] = useState<'loading' | 'not_found' | 'found' | 'generating' | 'failed'>('loading');
    const [fileName, setFileName] = useState<string>('');
    const [pollingAttempts, setPollingAttempts] = useState(0);
    const [timeoutWarning, setTimeoutWarning] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const maxPollingAttempts = 40; // Poll for up to 2 minutes (40 * 3 seconds)
    let pollingIntervalRef: NodeJS.Timeout | null = null;

    useEffect(() => {
        if (!videoId) {
            setError('No video selected');
            setLoading(false);
            return;
        }
        loadVideo();
    }, [videoId]);

    const loadVideo = async () => {
        if (!videoId) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch video details
            const videosResponse = await api.getUserVideos();
            const video = videosResponse.all_video.find(v => v.id === parseInt(videoId));

            if (!video) {
                setError('Video not found');
                setLoading(false);
                return;
            }

            setFileName(video.original_name);

            // Get video download URL
            const urlResponse = await api.getVideoDownloadUrl(video.s3_key);
            setVideoUrl(urlResponse.download_url);

            // Try to fetch existing transcription
            await loadTranscription(parseInt(videoId));

            setLoading(false);
        } catch (err) {
            console.error('Error loading video:', err);
            setError('Failed to load video');
            setLoading(false);
        }
    };

    const loadTranscription = async (vidId: number) => {
        try {
            setTranscriptionStatus('loading');
            const transcription = await api.getTranscription(vidId);

            // Check if transcription failed
            if (transcription.status === 'FAILED') {
                setTranscriptionStatus('failed');
                setSubtitles([]);
                return;
            }

            setSubtitles(transcription.subtitles);
            setTranscriptionStatus('found');
        } catch (err: any) {
            if (err.message === 'NOT_FOUND') {
                setTranscriptionStatus('not_found');
                setSubtitles([]);
            } else {
                console.error('Error loading transcription:', err);
                setTranscriptionStatus('not_found');
            }
        }
    };

    const handleGenerateCaptions = async () => {
        if (!videoId) return;

        try {
            setTranscriptionStatus('generating');
            setPollingAttempts(0);
            await api.startTranscription(parseInt(videoId));

            // Start polling for completion
            startPolling(parseInt(videoId));
        } catch (err) {
            console.error('Error generating captions:', err);
            setTranscriptionStatus('not_found');
            setError('Failed to generate captions');
        }
    };

    const handleRegenerateCaptions = async () => {
        if (!videoId) return;

        const confirmed = window.confirm('Are you sure you want to regenerate captions? This will replace all existing captions.');
        if (!confirmed) return;

        try {
            setTranscriptionStatus('generating');
            setPollingAttempts(0);
            await api.regenerateTranscription(parseInt(videoId));

            // Start polling for completion
            startPolling(parseInt(videoId));
        } catch (err) {
            console.error('Error regenerating captions:', err);
            setError('Failed to regenerate captions');
            // Restore previous status
            await loadTranscription(parseInt(videoId));
        }
    };

    const handleRetryFailedCaptions = async () => {
        if (!videoId) return;

        try {
            setTranscriptionStatus('generating');
            setPollingAttempts(0);
            await api.regenerateTranscription(parseInt(videoId));

            // Start polling for completion
            startPolling(parseInt(videoId));
        } catch (err) {
            console.error('Error retrying captions:', err);
            setTranscriptionStatus('failed');
            setError('Failed to retry caption generation');
        }
    };

    const startPolling = (vidId: number) => {
        // Clear any existing polling
        if (pollingIntervalRef) {
            clearInterval(pollingIntervalRef);
        }

        setTimeoutWarning(false);

        pollingIntervalRef = setInterval(async () => {
            try {
                setPollingAttempts(prev => {
                    const newCount = prev + 1;

                    // Show timeout warning but keep polling
                    if (newCount >= maxPollingAttempts) {
                        setTimeoutWarning(true);
                        // Don't stop polling, just show warning
                    }

                    return newCount;
                });

                // Try to fetch the transcription
                const transcription = await api.getTranscription(vidId);

                // If we got here, transcription exists
                if (transcription.subtitles && transcription.subtitles.length > 0) {
                    if (pollingIntervalRef) {
                        clearInterval(pollingIntervalRef);
                        pollingIntervalRef = null;
                    }
                    // Create new array reference to ensure React detects the change
                    setSubtitles([...transcription.subtitles]);
                    setTranscriptionStatus('found');
                    setPollingAttempts(0);
                    setTimeoutWarning(false);
                }
            } catch (err: any) {
                // If not found, keep polling
                if (err.message !== 'NOT_FOUND') {
                    console.error('Error polling transcription:', err);
                }
                // Continue polling...
            }
        }, 3000); // Poll every 3 seconds
    };

    const handleExport = async () => {
        if (!videoId) return;

        try {
            setExportLoading(true);
            const { task_id } = await api.burnVideo(parseInt(videoId));

            // Poll for burnout status
            const burnPollInterval = setInterval(async () => {
                try {
                    const status = await api.getBurnStatus(task_id);

                    if (status.status === 'SUCCESS' && status.download_endpoint) {
                        clearInterval(burnPollInterval);
                        setExportLoading(false);

                        // Trigger download
                        // Construct absolute URL for the download
                        const downloadUrl = `http://localhost:8000${status.download_endpoint}`;

                        // Create temporary link to trigger download
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = `exported_video_${videoId}.mp4`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                    } else if (status.status === 'FAILURE') {
                        clearInterval(burnPollInterval);
                        setExportLoading(false);
                        setError('Export failed: ' + (status.error || 'Unknown error'));
                    }
                    // If PENDING, continue polling

                } catch (err) {
                    console.error("Polling error", err);
                    // Don't stop polling immediately on network error, but maybe count errors?
                }
            }, 3000);

        } catch (err) {
            console.error('Error starting export:', err);
            setExportLoading(false);
            setError('Failed to start export process');
        }
    };

    const handleSubtitlesChange = async (updatedSubtitles: any) => {
        console.log('Subtitles updated:', updatedSubtitles);
        setSubtitles(updatedSubtitles);

        // Auto-save to backend
        if (videoId && transcriptionStatus === 'found') {
            try {
                await api.updateTranscription(parseInt(videoId), updatedSubtitles);
                console.log('Subtitles saved successfully');
            } catch (err) {
                console.error('Error saving subtitles:', err);
                // Show error notification (you can add a toast notification here)
            }
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-sky-500 mx-auto mb-4 animate-spin" />
                    <p className="text-white text-lg">Loading video...</p>
                </div>
            </div>
        );
    }

    // Only show error screen if video failed to load initially
    if ((error && !videoUrl) || (!loading && !videoUrl)) {
        return (
            <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <p className="text-white text-lg mb-4">{error || 'Failed to load video'}</p>
                    <button
                        onClick={() => navigate('/projects')}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950">
            <div className='hidden lg:block'>
                <VideoEditor
                    key={`editor-${transcriptionStatus}-${subtitles.length}`}
                    videoUrl={videoUrl}
                    subtitles={subtitles.length > 0 ? subtitles : MOCK_SUBTITLES}
                    onSubtitlesChange={handleSubtitlesChange}
                    onExport={handleExport}
                    exportLoading={exportLoading}
                />

                {/* Compact Status Badge */}
                <div className="absolute top-6 right-6 z-50">
                    {transcriptionStatus === 'not_found' && (
                        <button
                            onClick={handleGenerateCaptions}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
                        >
                            <Sparkles size={16} />
                            Generate Captions
                        </button>
                    )}

                    {transcriptionStatus === 'failed' && (
                        <button
                            onClick={handleRetryFailedCaptions}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
                        >
                            <AlertCircle size={16} />
                            Retry Failed Generation
                        </button>
                    )}

                </div>
            </div>
            <div className='lg:hidden'>
                <VideoEditorMobile
                    key={`editor-mobile-${transcriptionStatus}-${subtitles.length}`}
                    videoUrl={videoUrl}
                    subtitles={subtitles.length > 0 ? subtitles : MOCK_SUBTITLES}
                    onSubtitlesChange={handleSubtitlesChange}
                />

                {/* Mobile Compact Status Badge */}
                <div className="absolute top-4 right-4 z-50">
                    {transcriptionStatus === 'not_found' && (
                        <button
                            onClick={handleGenerateCaptions}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
                        >
                            <Sparkles size={14} />
                            Generate
                        </button>
                    )}

                    {transcriptionStatus === 'failed' && (
                        <button
                            onClick={handleRetryFailedCaptions}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
                        >
                            <AlertCircle size={14} />
                            Retry
                        </button>
                    )}



                    {transcriptionStatus === 'generating' && (
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 bg-sky-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-xs font-medium">
                                    {pollingAttempts > 0 ? `${pollingAttempts * 3}s` : 'Generating...'}
                                </span>
                            </div>
                            {timeoutWarning && (
                                <div className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg shadow-lg">
                                    <AlertCircle size={12} />
                                    <span className="text-[10px]">Still checking...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
