export type NavItem = {
  label: string;
  href: string;
  variant?: "primary";
  collapseAtTablet?: boolean;
};

export type SiteData = {
  meta: {
    title: string;
    description: string;
  };
  brand: {
    name: string;
    fullName: string;
    logoIcon?: string;
    logoImage?: string;
  };
  navigation: NavItem[];
  hero: {
    eyebrow: string;
    title: string;
    titleLines?: string[];
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    backgroundImage: string;
  };
  about: any;
  classSection: any;
  whyUs: any;
  testimonials: any;
  location: any;
  booking: any;
  footer: any;
  contactSection: any;
};
