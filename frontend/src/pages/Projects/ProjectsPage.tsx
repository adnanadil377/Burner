import { useState } from 'react';
import { Folder, MoreVertical, Calendar } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { FileUpload } from '../../components/Dashboard/FileUpload';

/**
 * Projects Page
 * 
 * Browse and manage all video projects
 */
export default function ProjectsPage() {
  // Mock data - replace with real data from your backend
  const projects = [
    {
      id: 1,
      name: 'Summer Vacation 2025',
      thumbnail: null,
      updatedAt: '2025-12-10',
      duration: '3:45'
    },
    {
      id: 2,
      name: 'Product Demo',
      thumbnail: null,
      updatedAt: '2025-12-08',
      duration: '2:15'
    }
  ];

  const [modalOpen, setModalOpen] = useState(false);

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
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
            <Folder size={48} className="text-neutral-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No projects yet</h3>
            <p className="text-neutral-400">
              Create your first project to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface Project {
  id: number;
  name: string;
  thumbnail: string | null;
  updatedAt: string;
  duration: string;
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all group cursor-pointer">
      {/* Thumbnail */}
      <div className="aspect-video bg-neutral-800 flex items-center justify-center">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <Folder size={48} className="text-neutral-600" />
        )}
      </div>
      
      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-medium line-clamp-1">{project.name}</h3>
          <button className="p-1 hover:bg-neutral-800 rounded transition-colors">
            <MoreVertical size={16} className="text-neutral-400" />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(project.updatedAt).toLocaleDateString()}
          </span>
          <span>{project.duration}</span>
        </div>
      </div>
    </div>
  );
}
