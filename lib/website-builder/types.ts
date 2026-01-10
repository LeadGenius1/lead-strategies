// Website Builder Types
// Defines the data structures for the website builder

export interface Section {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'contact' | 'pricing' | 'faq';
  content: Record<string, any>;
  settings?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    spacing?: number;
  };
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  settings?: {
    metaTitle?: string;
    metaDescription?: string;
    favicon?: string;
  };
}

export interface WebsiteData {
  id: string;
  name: string;
  domain?: string;
  subdomain?: string;
  theme: string;
  pages: Page[];
  settings: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    logo?: string;
  };
}

export interface SectionTemplate {
  type: Section['type'];
  name: string;
  description: string;
  icon: string;
  defaultContent: Record<string, any>;
  defaultSettings?: Section['settings'];
}
