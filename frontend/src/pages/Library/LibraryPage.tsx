import { Image, Video, Music } from 'lucide-react';

/**
 * Library Page
 * 
 * Media library for managing assets
 */
export default function LibraryPage() {
  const categories = [
    { id: 'videos', name: 'Videos', icon: Video, count: 0 },
    { id: 'images', name: 'Images', icon: Image, count: 0 },
    { id: 'audio', name: 'Audio', icon: Music, count: 0 }
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-left hover:border-amber-500/50 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                    <Icon size={24} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{category.name}</h3>
                    <p className="text-neutral-400 text-sm">{category.count} items</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
          <Image size={48} className="text-neutral-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Your library is empty</h3>
          <p className="text-neutral-400">
            Upload media files to organize your assets
          </p>
        </div>
      </div>
    </div>
  );
}
