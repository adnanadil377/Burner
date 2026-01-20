import { useState, useEffect } from 'react';
import { Folder, MoreVertical, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import { FileUpload } from '../../components/Dashboard/FileUpload';
import { api, type Video } from '../../services/api';

/**
 * Projects Page
 * 
 * Browse and manage all video projects
 */
export default function ProjectsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUserVideos();
      setVideos(response.all_video || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    navigate(`/editor?videoId=${video.id}`);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex items-center justify-end mb-2 pt-2">
          <button
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-7 py-2.5 rounded-xl text-base transition-all shadow-md"
            onClick={() => setModalOpen(true)}
          >
            <span className="text-lg font-bold">+</span>
            Add Project
          </button>
        </div>

        {/* Modal for File Upload */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="px-8 py-7 w-[420px] max-w-full">
            <h2 className="text-2xl font-extrabold text-white mb-7 font-serif">Create New Project</h2>
            <FileUpload />
            <div className="flex gap-4 mt-8">
              <button
                className="flex-1 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold transition shadow"
                // This button can be wired to trigger upload if needed
                onClick={() => {}}
                disabled
              >
                Upload
              </button>
            </div>
          </div>
        </Modal>

        {/* Projects Grid */}
        {loading ? (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
            <Loader2 size={48} className="text-sky-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-white font-semibold mb-2">Loading videos...</h3>
          </div>
        ) : error ? (
          <div className="bg-neutral-900 rounded-xl border border-red-800 p-12 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchVideos}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
            >
              Retry
            </button>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} onClick={() => handleVideoClick(video)} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
            <Folder size={48} className="text-neutral-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No videos yet</h3>
            <p className="text-neutral-400">
              Upload your first video to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video, onClick }: { video: Video; onClick: () => void }) {
  const statusColors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    COMPLETED: 'text-green-400 bg-green-400/10',
    PROCESSING: 'text-blue-400 bg-blue-400/10',
    FAILED: 'text-red-400 bg-red-400/10',
  };

  const statusColor = statusColors[video.status] || 'text-neutral-400 bg-neutral-400/10';

  return (
    <div 
      onClick={onClick}
      className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center relative overflow-hidden">
        <Folder size={48} className="text-neutral-600 group-hover:text-sky-500 transition-colors" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-medium line-clamp-1 flex-1">{video.original_name}</h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Add menu logic here
            }}
            className="p-1 hover:bg-neutral-800 rounded transition-colors ml-2"
          >
            <MoreVertical size={16} className="text-neutral-400" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
            {video.status}
          </span>
          <span className="text-xs text-neutral-500">ID: {video.id}</span>
        </div>
      </div>
    </div>
  );
}
