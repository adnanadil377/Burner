import { Upload, Plus } from 'lucide-react';

/**
 * Dashboard Overview Page
 * 
 * Main landing page after login with quick actions and stats
 */
export default function DashboardOverview() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard 
            title="Upload Video"
            description="Start a new project"
            icon={Upload}
            onClick={() => console.log('Upload')}
          />
          <QuickActionCard 
            title="New Project"
            description="Create from scratch"
            icon={Plus}
            onClick={() => console.log('New Project')}
          />
        </div>

        {/* Recent Projects */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Projects</h2>
          <div className="text-neutral-400 text-center py-12">
            No projects yet. Upload your first video to get started!
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-left hover:border-amber-500/50 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
          <Icon size={24} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-white font-semibold mb-1">{title}</h3>
          <p className="text-neutral-400 text-sm">{description}</p>
        </div>
      </div>
    </button>
  );
}
