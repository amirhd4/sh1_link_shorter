export interface LinkStatDay {
  date: string;
  clicks: number;
}

export interface LinkStatsResponse {
  clicks_last_7_days: LinkStatDay[];
}

export interface PlanResponse {
  id: number;
  name: string;
  price: number;
  link_limit_per_month: number;
  duration_days: number;
}

export interface UserResponse {
  id: number;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  plan?: PlanResponse | null;
  subscription_end_date?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LinkDetails {
    long_url: string;
    short_code: string;
    clicks: number;
    created_at: string;
    domain_id: string;
    domain_name: string;

    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;

    show_ads: boolean;
}

export interface URLResponse {
  long_url: string;
  short_url: string;
  show_ads: boolean;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}


export interface LinkDetailsForAdmin {
  long_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
  owner: {
    id: number;
    email: string;
  };
}

export interface SystemStats {
  total_users: number;
  total_links: number;
  total_clicks: number;
  new_users_last_7_days: DailyStat[];
}


export interface TransactionResponse {
  id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  authority: string;
  created_at: string;
  plan: {
    name: string;
  };
}

export interface OtpLoginResponse {
  access_token: string;
  token_type: "bearer";
}

export interface UserWithToken extends UserResponse {
  access_token: string;
  token_type: "bearer";
}

export interface ReferrerStat {
  referer?: string | null;
  clicks: number;
}

export interface UserAgentStat {
  user_agent: string;
  clicks: number;
}

export interface GeoStat {
  country?: string | null;
  region?: string | null;
  city?: string | null;
  clicks: number;
}

export interface AdvancedLinkStats {
  total_clicks: number;
  unique_ips: number;
  bot_clicks: number;
  geos: GeoStat[];
  top_referrers: ReferrerStat[];
  user_agents: UserAgentStat[];
  clicks_last_7_days: LinkStatDay[];
}

export interface DomainResponse {
  id: number;
  name: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
}

export interface URLCreate {
  long_url: string;
  domain_id?: number | 0;

  show_ads?: boolean;
}

type UpdateLinkPayload = {
    shortCode: string;
    long_url: string;
    domainId: string | number;

    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;

    show_ads?: boolean;
};


export interface AdReward {
  link_short_code: string;
  link_long_url: string;
  ad_views: number;
  points: number;
  last_view_at: string;
}

export interface AdSystemStats {
  total_ad_views: number;
  total_unique_ad_views: number;
  total_points_rewarded: number;
}