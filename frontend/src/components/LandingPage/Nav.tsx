import { Navigate, redirect, useNavigate } from "react-router";

const Nav = () => {
    const navigate = useNavigate();
    const handleLogin = () =>{
          navigate('/login');
        
    }
  return (
    <nav className="flex items-center justify-between px-6 md:px-12  py-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2 font-bold text-lg">
        <div className="w-8 h-8 flex items-center justify-center text-base">🔥</div>
        <span className="font-bold text-xl">Caption Burn</span>
      </div>
      <div className="hidden md:flex items-center gap-8 lg:gap-12">
        <a href="#" className="text-white transition hover:text-gray-300">How it works</a>
        <a href="#" className="text-white transition hover:text-gray-300">Features</a>
        <a href="#" className="text-white transition hover:text-gray-300">Reviews</a>
       </div>
       <div className="flex items-center gap-4">
            <button onClick={handleLogin} className="hidden md:block text-sm font-normal hover:text-white text-gray-300 transition">Log in</button>
            <button className="bg-[#3B3B52] hover:bg-[#4A4A62] text-white px-5 py-2 rounded-lg text-sm font-medium transition">
              Start for free
            </button>
        </div>
    </nav>
  )
}

export default Nav
