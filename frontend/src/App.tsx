import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Comparison } from './components/Comparison';
import { Pricing } from './components/Pricing';

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
