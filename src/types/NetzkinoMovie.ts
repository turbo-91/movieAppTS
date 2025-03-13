export interface NetzkinoMovie {
  id: number;
  slug: string;
  title: string;
  content?: string;
  custom_fields?: {
    Jahr?: string[];
    Regisseur?: string[];
    Stars?: string[];
    ["IMDb-Link"]?: string[];
    featured_img_all?: string[];
    featured_img_all_small?: string[];
  };
  thumbnail?: string;
}
