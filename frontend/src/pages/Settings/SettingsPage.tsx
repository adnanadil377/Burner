import { User, Bell, Palette, Shield } from 'lucide-react';

/**
 * Settings Page
 * 
 * User preferences and account settings
 */
export default function SettingsPage() {
  const sections = [
    {
      id: 'account',
      title: 'Account',
      description: 'Manage your account settings',
      icon: User
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: Bell
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel',
      icon: Palette
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Control your privacy settings',
      icon: Shield
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-amber-500/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Icon size={24} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{section.title}</h3>
                  <p className="text-neutral-400 text-sm mb-4">{section.description}</p>
                  <button className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
                    Configure →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
