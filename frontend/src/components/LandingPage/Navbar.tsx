import { useState, useEffect } from 'react';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[1000] border-b transition-all duration-300 ${
        isScrolled 
          ? 'bg-[rgba(10,10,12,0.95)] border-[rgba(255,94,0,0.2)] shadow-[0_4px_24px_rgba(255,94,0,0.1)]' 
          : 'bg-[rgba(10,10,12,0.7)] border-[rgba(255,94,0,0.1)]'
      } backdrop-blur-[20px]`}
    >
      <div className="max-w-[1400px] mx-auto px-8 py-5 flex justify-between items-center">
        <a 
          href="/" 
          className="flex items-center gap-2.5 text-[1.75rem] font-extrabold text-white no-underline transition-transform duration-200 hover:scale-105"
        >
          🔥 <span className="gradient-text -tracking-[0.02em]">Burner</span>
        </a>

        <div className="flex items-center gap-6">
          <button 
            onClick={scrollToPricing} 
            className="bg-transparent border-none text-[#B4B4C8] text-base font-semibold cursor-pointer px-4 py-2 transition-colors duration-200 relative
              after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[80%] after:h-0.5 after:bg-[#FF5E00] after:scale-x-0 after:transition-transform after:duration-300
              hover:text-white hover:after:scale-x-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5E00]"
          >
            Pricing
          </button>
          <button className="bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] border-none text-white text-base font-bold px-8 py-3 rounded-xl cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(255,94,0,0.3)] hover:shadow-[0_6px_24px_rgba(255,94,0,0.5)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5E00]">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};
