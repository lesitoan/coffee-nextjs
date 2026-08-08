import { JsonLd } from "@/components/seo/JsonLd";
import { courseJsonLd, localBusinessJsonLd } from "@/lib/seo/jsonLd";
import { siteData } from "@/lib/content/site";
import { AboutSection } from "./AboutSection";
import { BookingPreviewSection } from "./BookingPreviewSection";
import { ClassSection } from "./ClassSection";
import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { LocationSection } from "./LocationSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { WhyUsSection } from "./WhyUsSection";

export function HomeScreen() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd(siteData)} />
      <JsonLd data={courseJsonLd(siteData)} />
      <HeroSection />
      <AboutSection />
      <ClassSection />
      <WhyUsSection />
      <TestimonialsSection />
      <BookingPreviewSection />
      <ContactSection />
      <LocationSection />
    </>
  );
}
