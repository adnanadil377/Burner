import { Folder, MoreVertical, Calendar } from 'lucide-react';

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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
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
