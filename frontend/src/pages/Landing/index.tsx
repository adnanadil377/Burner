import { Comparison } from "../../components/LandingPage/Comparison";
import { Hero } from "../../components/LandingPage/Hero";
import { HowItWorks } from "../../components/LandingPage/HowItWorks";
import { Pricing } from "../../components/LandingPage/Pricing";

export default function Landing() {
  return (
    <div className="w-full overflow-x-hidden">
      <Hero />
      <HowItWorks />
      <Comparison />
      <Pricing />
    </div>
  );
}
