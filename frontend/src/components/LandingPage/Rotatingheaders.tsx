import { useState, useEffect } from 'react';
import { Apple, Globe, Keyboard, Monitor, Smartphone } from 'lucide-react';

const RotatingHeader = () => {
  const [index, setIndex] = useState(0);

  const WORDS = [
    { 
      text: "Like magic", 
      color: "from-[#FF6B6B] via-[#FF5252] to-[#FF4444]" // Original Red
    },
    { 
      text: "In seconds", 
      color: "from-[#78CDFA] to-[#78CDFA]" // Electric Blue (Speed)
    },
    { 
      text: "Zero effort", 
      color: "from-[#00B99A] to-[#00B99A]" // Green (Easy/Success)
    },
    { 
      text: "Automatically", 
      color: "from-[#a855f7] to-[#d946ef]" // Purple/Pink (AI/Tech)
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 2500); // Rotates every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold tracking-tight pt-10 flex flex-col gap-2">
            <span>Your story.</span>
            <span>Captioned instantly.</span>
        
        <div className="relative mt-6 h-[1em] overflow-hidden w-full">
          {WORDS.map((word, i) => (
            <span
              key={i}
              className={`
                absolute left-0 bg-gradient-to-r ${word.color} bg-clip-text text-transparent
                transition-all duration-700 ease-in-out whitespace-nowrap
                ${i === index ? 'top-0 opacity-100 transform translate-y-0' : ''}
                ${i > index ? 'top-0 opacity-0 transform translate-y-full' : ''}
                ${i < index ? 'top-0 opacity-0 transform -translate-y-full' : ''}
              `}
            >
              {word.text}
            </span>
          ))}
        </div>
      </h1>

      <p className="text-[17px] md:text-[19px] text-[#B4B7C0] max-w-md leading-[1.6] pt-2">
        Stop typing captions manually <span className="inline-block align-middle mx-0.5"><Keyboard className="w-[18px] h-[18px]"/></span>. 
        <br />
        Let AI burn them in seconds ✨
      </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3.5 rounded-[14px] text-[17px] font-semibold transition-all duration-200 shadow-lg shadow-purple-500/20">
              Start for free
            </button>
          </div>

          {/* Platform Icons */}
          <div className="flex items-center gap-6 text-[#8B8D98] text-[15px] font-normal pt-4">
            <span className="flex items-center gap-2"><Apple size={18} strokeWidth={1.5} /> iOS</span>
            <span className="flex items-center gap-2"><Smartphone size={18} strokeWidth={1.5} /> Android</span>
            <span className="flex items-center gap-2"><Globe size={18} strokeWidth={1.5} /> Web</span>
            <span className="flex items-center gap-2"><Monitor size={18} strokeWidth={1.5} /> macOS</span>
          </div>

          {/* Social Proof (Avatar Stack) */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-[#1B1B2F] bg-gray-600 flex items-center justify-center text-xs overflow-hidden">
                   <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-[13px] leading-tight">
              <p className="text-gray-300 font-normal">Trusted by</p>
              <p className="text-white font-normal">100,000 users</p>
            </div>
          </div>
    </div>
  );
};

export default RotatingHeader;