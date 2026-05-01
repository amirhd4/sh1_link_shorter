export type LinkTypeEnum =
  | "url"
  | "email"
  | "phone"
  | "text"
  | "payment";

export interface BioLink {
  id: number;
  title: string;
  value: string;
  link_type: LinkTypeEnum;
  icon?: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
}

export interface BioPage {
  id: number;
  user_id: number;

  slug: string;
  title?: string | null;
  description?: string | null;
  avatar_url?: string | null;

  is_active: boolean;
  is_public: boolean;

  created_at: string;
  updated_at?: string | null;

  links?: BioLink[];
  user:{
      first_name: string;
      last_name: string;
      phone_number: string;
  } | null;
}
