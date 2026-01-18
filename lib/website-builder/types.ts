// Website Builder Types

export interface WebsiteSection {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'testimonials' | 'contact' | 'cta' | 'content';
  content: Record<string, any>;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    padding?: { top: number; bottom: number; left?: number; right?: number };
    [key: string]: any;
  };
}

export interface WebsitePage {
  id: string;
  name: string;
  slug: string;
  sections: WebsiteSection[];
}

export interface WebsiteData {
  pages: WebsitePage[];
  settings: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    [key: string]: any;
  };
}
