import { Mic, Apple, Smartphone, Monitor, Globe, Keyboard } from 'lucide-react';
import Nav from './Nav';
import RotatingHeader from './Rotatingheaders';

export const Hero = () => {
  return (
    <div className="min-h-screen  bg-gradient-to-br from-[#E8D5E8] via-[#F0D9E8] to-[#F5E1DD] text-white font-sans selection:bg-[#7C3AED] selection:text-white overflow-hidden p-3">
      
      {/* Island Container */}
      <div className="bg-[#111022] pl-24 rounded-[32px] md:rounded-[48px] min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh)] overflow-hidden">
        <Nav />
        {/* 2. HERO CONTENT */}
        <main className="max-w-[1400px] mx-auto px-6 md:px-12 mt-8 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center pb-12 md:pb-20">
        
        {/* LEFT COLUMN: Text */}
        <RotatingHeader />

        {/* RIGHT COLUMN: Device Mockups */}
        <div className="relative h-[500px] md:h-[550px] w-full flex items-center justify-center lg:justify-end">
          
          {/* Background Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="absolute right-0 top-8 w-[520px] h-[340px] bg-[#1E1E2E] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
<div className="h-8 bg-[#151521] border-b border-white/10 flex items-center px-3 gap-1.5">
               <div className="w-3 h-3 rounded-full bg-[#ED6A5E]"></div>
               <div className="w-3 h-3 rounded-full bg-[#F5BF4F]"></div>
               <div className="w-3 h-3 rounded-full bg-[#61C554]"></div>
               <div className="ml-auto flex gap-2 text-[10px] text-gray-400">
                  <span>File</span>
                  <span>Edit</span>
                  <span>View</span>
                  <span>Help</span>
               </div>
            </div>
            
            <div className="flex h-[calc(100%-2rem)]">
              <div className="w-12 bg-[#1A1A28] border-r border-white/5 flex flex-col items-center py-3 gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center text-purple-400 text-xs">✂️</div>
                <div className="w-8 h-8 rounded flex items-center justify-center text-gray-500 text-xs">🎬</div>
                <div className="w-8 h-8 rounded flex items-center justify-center text-gray-500 text-xs">🎵</div>
                <div className="w-8 h-8 rounded flex items-center justify-center text-gray-500 text-xs">💬</div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-black/40 flex items-center justify-center relative">
                  <div className="w-[85%] h-[70%] bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg border border-white/10 flex items-center justify-center">
                    <div className="text-white/40 text-4xl">▶️</div>
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
                    <button className="text-white/60 hover:text-white text-xs">⏮</button>
                    <button className="text-white text-sm">▶️</button>
                    <button className="text-white/60 hover:text-white text-xs">⏭</button>
                    <span className="text-white/40 text-[10px] ml-2">00:12 / 02:45</span>
                  </div>
                </div>

                <div className="h-24 bg-[#1A1A28] border-t border-white/10 p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-[9px] text-gray-400 w-12">Video</div>
                    <div className="flex-1 flex gap-1">
                      <div className="h-10 bg-gradient-to-r from-purple-600 to-purple-500 rounded flex-1"></div>
                      <div className="h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded w-20"></div>
                      <div className="h-10 bg-gradient-to-r from-purple-600 to-purple-500 rounded flex-1"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[9px] text-gray-400 w-12">Audio</div>
                    <div className="flex-1 h-6 bg-green-600/40 rounded relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center gap-[2px] px-1">
                        {Array.from({ length: 50 }).map((_, i) => (
                          <div key={i} className="w-[2px] bg-green-400/60 rounded-full" style={{ height: `${Math.random() * 100}%` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Phone Layer (Front Left) */}
          {/* <div className="absolute left-0 bottom-4 w-[240px] h-[490px] bg-[#0A0A0F] rounded-[3rem] border-[10px] border-[#1F1F2A] shadow-2xl overflow-hidden z-10 flex flex-col">
            <div className="h-7 w-full bg-[#0A0A0F] flex justify-center items-end">
                <div className="w-20 h-5 bg-black rounded-b-2xl"></div>
            </div>
            <div className="flex-1 bg-[#0A0A0F] flex flex-col items-center justify-center p-6 relative">
                 <div className="absolute top-8 left-0 right-0 flex justify-between px-6 text-white/60 text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1 items-center">
                       <span>📶</span>
                       <span>🔋</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1.5 h-28 mb-12">
                    {[50, 80, 65, 90, 70, 95, 75].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-2.5 bg-white rounded-full animate-pulse" 
                          style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                        ></div>
                    ))}
                 </div>
                 
                 <div className="flex items-center gap-6">
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                       🔄
                    </button>
                    <button className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500">
                       <div className="w-5 h-5 bg-red-500 rounded-sm"></div>
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                       ⏸
                    </button>
                 </div>
            </div>
          </div> */}

        </div>
      </main>
      
      </div>
    </div>
  );
};