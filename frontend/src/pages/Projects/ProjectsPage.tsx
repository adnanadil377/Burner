import { useEffect, useState } from 'react';
import { Folder, MoreVertical, Calendar } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FileUpload } from '../../components/Dashboard/FileUpload';
import axios from 'axios';

/**
 * Projects Page
 * 
 * Browse and manage all video projects
 */
export default function ProjectsPage() {
  const [proj, setProj] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  
  useEffect(() => {
    setIsLoading(true);
    axios.get("http://127.0.0.1:8000/video/get_user_videos", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then((response) => {
      console.log(response.data.all_video);
      setProj(response.data.all_video || []);
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-12 pt-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Your Projects</h1>
            <p className="text-neutral-400 text-lg">Create, edit, and manage your video projects</p>
          </div>
          <button
            className="relative flex items-center gap-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold px-8 py-3.5 rounded-2xl text-base transition-all shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 group overflow-hidden"
            onClick={() => setModalOpen(true)}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            <span className="text-2xl leading-none">+</span>
            <span className="relative">New Project</span>
          </button>
        </div>

        {/* Modal for File Upload */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="px-8 py-7 w-[480px] max-w-full bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 mb-8 tracking-tight">Create New Project</h2>
            <FileUpload />
            <div className="flex gap-4 mt-8">
              <button
                className="flex-1 py-3 rounded-xl border-2 border-neutral-700 bg-transparent text-white font-bold hover:bg-neutral-800 hover:border-neutral-600 transition-all"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {}}
                disabled
              >
                Upload
              </button>
            </div>
          </div>
        </Modal>
    
        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-neutral-800"></div>
                <div className="p-5">
                  <div className="h-4 bg-neutral-800 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : proj && proj.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {proj.map(pro => (
              <ProjectCard key={pro.id} project={pro} />
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border-2 border-dashed border-neutral-700 rounded-3xl p-16 text-center hover:border-orange-500/30 transition-all duration-500">
            <div className="inline-block p-6 bg-gradient-to-br from-orange-500/10 to-rose-500/10 rounded-full mb-6">
              <Folder size={56} className="text-orange-400" />
            </div>
            <h3 className="text-white font-bold text-2xl mb-3">No projects yet</h3>
            <p className="text-neutral-400 text-lg mb-6">
              Start creating your first video project
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
            >
              <span className="text-xl">+</span>
              Create Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface Project {
  id: number;
  original_name: string;
  s3_key: string;
  status: string;
  bucket: string;
  user_id: string;
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    PROCESSING: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
    FAILED: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group cursor-pointer hover:scale-[1.02]">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-neutral-800 via-neutral-850 to-neutral-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Folder size={56} className="text-neutral-600 group-hover:text-orange-500/50 transition-colors duration-300 relative z-10" />
      </div>
      
      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-white font-bold text-base line-clamp-2 flex-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-rose-400 transition-all duration-300">
            {project.original_name}
          </h3>
          <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors ml-2">
            <MoreVertical size={18} className="text-neutral-400 group-hover:text-orange-400" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusColors[project.status as keyof typeof statusColors] || statusColors.PENDING}`}>
            {project.status}
          </span>
          <span className="text-xs text-neutral-500 font-medium">
            ID: {project.id}
          </span>
        </div>
      </div>
    </div>
  );
}
