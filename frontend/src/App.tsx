import { Navbar } from './components/LandingPage/Navbar';
import { Hero } from './components/LandingPage/Hero';
import { HowItWorks } from './components/LandingPage/HowItWorks';
import { Comparison } from './components/LandingPage/Comparison';
import { Pricing } from './components/LandingPage/Pricing';

function App() {
  return (
    <div className="w-full overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Comparison />
      <Pricing />
    </div>
  );
}

export default App;
