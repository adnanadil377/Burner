export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: '☁️',
      title: 'Upload',
      description: 'Drag & drop your raw MP4. We handle the heavy lifting.',
      color: 'blue',
    },
    {
      number: '02',
      icon: '✨',
      title: 'Edit',
      description: 'AI transcribes it. You fix the typos and pick your colors instantly.',
      color: 'purple',
    },
    {
      number: '03',
      icon: '🔥',
      title: 'Export',
      description: 'Download your burned video, ready for TikTok, Reels, or Shorts.',
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: {
      hover: 'hover:border-blue-500/50 hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)]',
      glow: 'bg-blue-500/40',
    },
    purple: {
      hover: 'hover:border-purple-500/50 hover:shadow-[0_20px_60px_rgba(168,85,247,0.2)]',
      glow: 'bg-purple-500/40',
    },
    orange: {
      hover: 'hover:border-[#FF5E00]/50 hover:shadow-[0_20px_60px_rgba(255,94,0,0.2)]',
      glow: 'bg-[#FF5E00]/40',
    },
  };

  return (
    <section className="py-20 px-6 relative bg-gradient-to-b from-[#0A0A0C] to-[#0F0F12]">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-[#B4B4C8]">
            Three stupid-simple steps to viral-ready content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative bg-white/[0.02] border-2 border-white/[0.08] rounded-3xl p-10 flex flex-col items-start gap-6 overflow-hidden transition-all duration-300 
                hover:-translate-y-2 hover:border-white/20 ${colorClasses[step.color as keyof typeof colorClasses].hover} group`}
            >
              <div className="absolute top-6 right-6 text-5xl font-black text-white/5 leading-none">
                {step.number}
              </div>
              <div className="text-6xl leading-none drop-shadow-lg">
                {step.icon}
              </div>
              <h3 className="text-3xl font-extrabold text-white">
                {step.title}
              </h3>
              <p className="text-lg leading-relaxed text-[#B4B4C8]">
                {step.description}
              </p>
              <div 
                className={`absolute -bottom-1/2 -right-1/3 w-48 h-48 rounded-full blur-3xl opacity-0 transition-opacity duration-300 ${colorClasses[step.color as keyof typeof colorClasses].glow} group-hover:opacity-100`}
              ></div>
            </div>
          ))}
        </div>

        <div className="hidden md:flex absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent items-center justify-between">
          <div className="w-3 h-3 bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] rounded-full shadow-[0_0_20px_rgba(255,94,0,0.6)] animate-pulse-dot"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] rounded-full shadow-[0_0_20px_rgba(255,94,0,0.6)] animate-pulse-dot" style={{animationDelay: '0.5s'}}></div>
          <div className="w-3 h-3 bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] rounded-full shadow-[0_0_20px_rgba(255,94,0,0.6)] animate-pulse-dot" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    </section>
  );
};
