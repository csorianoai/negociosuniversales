import { Hero } from '@/components/marketing/Hero';
import { CredibilityStrip } from '@/components/marketing/CredibilityStrip';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { Pipeline } from '@/components/marketing/Pipeline';
import { SecuritySection } from '@/components/marketing/SecuritySection';
import { Verticals } from '@/components/marketing/Verticals';
import { RoiStats } from '@/components/marketing/RoiStats';
import { FAQPreview } from '@/components/marketing/FAQPreview';
import { Section } from '@/components/marketing/Section';
import { CTAForm } from '@/components/marketing/CTAForm';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <CredibilityStrip />
      <FeatureGrid />
      <Pipeline />
      <SecuritySection />
      <Verticals />
      <RoiStats />
      <FAQPreview />
      <Section title="Solicitar demo" subtitle="Complete el formulario y nos pondremos en contacto">
        <CTAForm />
      </Section>
    </>
  );
}
