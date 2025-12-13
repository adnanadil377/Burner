export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center px-8 pt-32 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col gap-8 items-start">
          <h1 className="text-6xl font-black leading-tight tracking-tight text-white m-0">
            Viral Subtitles
            <br />
            <span className="gradient-text animate-shimmer">in Seconds.</span>
          </h1>

          <p className="text-xl leading-relaxed text-[#B4B4C8] max-w-lg m-0">
            Upload your video, edit the text instantly, and export with burn-in
            subtitles. <strong className="text-[#FF5E00] font-bold">No watermark for the first 3 videos.</strong>
          </p>

          <button className="bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] text-white text-xl font-extrabold px-12 py-5 rounded-2xl transition-all duration-300 shadow-[0_8px_32px_rgba(255,94,0,0.4)] flex items-center gap-3 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(255,94,0,0.5)] group">
            Start Burning for Free
            <span className="transition-transform duration-300 text-2xl group-hover:translate-x-1">→</span>
          </button>

          <div className="flex items-center gap-2.5 text-[#6E6E8C] text-sm px-5 py-3 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-[#00E676] font-black text-lg">✓</span>
            <span>Free forever • No credit card required</span>
          </div>
        </div>

        <div className="relative w-full max-w-2xl mx-auto">
          <div className="flex items-stretch gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <div className="flex-1 flex flex-col gap-3">
              <div className="relative w-full h-80 bg-gradient-to-br from-[#14141A] to-[#1E1E28] rounded-2xl overflow-hidden border-2 border-white/10">
                <div className="w-full h-full flex items-center justify-center">
                </div>
                <span className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-600/50 text-white/60">
                  Before
                </span>
              </div>
              <p className="text-center text-sm text-[#6E6E8C] m-0">Boring, no engagement</p>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] rounded-full flex items-center justify-center font-black text-white shadow-[0_4px_20px_rgba(255,94,0,0.5)] animate-[rotate_3s_linear_infinite]">
                VS
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="relative w-full h-80 bg-gradient-to-br from-[#14141A] to-[#1E1E28] rounded-2xl overflow-hidden border-2 border-[#FF5E00] shadow-[0_0_40px_rgba(255,94,0,0.3)]">
                <div className="w-full h-full flex items-center justify-center p-4 animate-[pulse_2s_ease-in-out_infinite]">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-[#FF5E00] text-white px-3 py-1.5 rounded-lg font-extrabold text-sm shadow-[0_4px_16px_rgba(255,94,0,0.6)] animate-[karaoke_2s_ease-in-out_infinite]">Viral</span>
                    <span className="bg-white/10 text-white/40 px-3 py-1.5 rounded-lg font-extrabold text-sm">Subtitles</span>
                    <span className="bg-white/10 text-white/40 px-3 py-1.5 rounded-lg font-extrabold text-sm">in</span>
                    <span className="bg-white/10 text-white/40 px-3 py-1.5 rounded-lg font-extrabold text-sm">Seconds</span>
                  </div>
                </div>
                <span className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] text-white">
                  After 🔥
                </span>
              </div>
              <p className="text-center text-sm text-[#FF5E00] font-bold m-0">Generated in 12 seconds</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-[float_8s_ease-in-out_infinite] bg-[radial-gradient(circle,#FF5E00,transparent)] top-[10%] left-[5%]"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-[float_8s_ease-in-out_infinite] bg-[radial-gradient(circle,#FF3C78,transparent)] bottom-[10%] right-[5%]" style={{animationDelay: '-4s'}}></div>
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,94,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,94,0,0.03)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
      </div>
    </section>
  );
};
