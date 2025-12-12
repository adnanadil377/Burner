export const Comparison = () => {
  const comparisons = [
    {
      pain: '2 hours of listening & typing',
      solution: '30 seconds of AI processing',
    },
    {
      pain: 'Hardcoding timestamps',
      solution: 'Auto-syncs to word level',
    },
    {
      pain: 'Boring standard fonts',
      solution: 'Viral, customizable styles',
    },
  ];

  return (
    <section className="py-20 px-6 relative bg-[#0A0A0C]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white mb-4">
            Why <span className="gradient-text">Burner?</span>
          </h2>
          <p className="text-xl text-[#B4B4C8]">
            Stop wasting time. Start creating content that converts.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white/[0.02] border-2 border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 bg-white/[0.03] border-b-2 border-white/[0.08]">
            <div className="p-8 text-center flex flex-col items-center gap-3 border-b md:border-b-0 md:border-r border-white/[0.08]">
              <span className="text-5xl">😴</span>
              <h3 className="text-2xl font-extrabold text-white">Manual Typing</h3>
            </div>
            <div className="p-8 text-center flex flex-col items-center gap-3 bg-gradient-to-br from-[#FF5E00]/10 to-[#FF3C78]/10 relative">
              <div className="absolute top-2 right-4 bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] text-white text-xs font-extrabold px-3 py-1 rounded-md tracking-wider">
                RECOMMENDED
              </div>
              <span className="text-5xl">🔥</span>
              <h3 className="text-2xl font-extrabold text-white">Burner App</h3>
            </div>
          </div>

          <div className="flex flex-col">
            {comparisons.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 border-b border-white/[0.06] transition-colors duration-300 hover:bg-white/[0.02] last:border-b-0">
                <div className="p-8 flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/[0.08]">
                  <span className="text-2xl flex-shrink-0">❌</span>
                  <p className="text-lg text-[#B4B4C8] leading-relaxed">{item.pain}</p>
                </div>
                <div className="p-8 flex items-center gap-4 bg-gradient-to-r from-[#FF5E00]/5 to-transparent">
                  <span className="text-2xl flex-shrink-0">✅</span>
                  <p className="text-lg text-white font-semibold leading-relaxed">{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-16">
          <button className="bg-transparent border-2 border-[#FF5E00] text-[#FF5E00] text-lg font-bold px-10 py-4 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden
            hover:text-white hover:border-[#FF5E00] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(255,94,0,0.4)] group">
            <span className="absolute inset-0 bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] translate-y-full transition-transform duration-300 group-hover:translate-y-0 -z-10"></span>
            See It In Action →
          </button>
        </div>
      </div>
    </section>
  );
};
