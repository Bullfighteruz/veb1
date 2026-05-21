import { useReveal } from "@/hooks/useReveal";
import CursorFollower from "@/components/features/CursorFollower";
import ScrollProgress from "@/components/features/ScrollProgress";
import Navigation from "@/components/features/Navigation";
import Hero from "@/components/features/Hero";
import ProblemInsight from "@/components/features/ProblemInsight";
import EngineNetwork from "@/components/features/EngineNetwork";
import PayPlan from "@/components/features/PayPlan";
import Transformation from "@/components/features/Transformation";
import AiMarquee from "@/components/features/AiMarquee";
import OptionalServices from "@/components/features/OptionalServices";
import PilotForm from "@/components/features/PilotForm";
import Footer from "@/components/features/Footer";
import CartDrawer from "@/components/features/CartDrawer";

export default function Index() {
  useReveal();
  return (
    <main className="relative min-h-screen bg-ink-900 text-white">
      <ScrollProgress />
      <CursorFollower />
      <Navigation />
      <Hero />
      <ProblemInsight />
      <EngineNetwork />
      <PayPlan />
      <Transformation />
      <AiMarquee />
      <OptionalServices />
      <PilotForm />
      <Footer />
      <CartDrawer />
    </main>
  );
}
