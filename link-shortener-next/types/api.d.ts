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

export interface AdminUserSummary {
  id: number;

  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;

  role: "user" | "admin";
  is_active: boolean;
  is_verified: boolean;

  // Plan
  plan_name?: string | null;
  plan_price?: number | null;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  is_subscription_active: boolean;

  // Stats
  total_links: number;
  total_domains: number;
  total_clicks: number;

  // Financial
  total_transactions: number;
  total_paid_amount: number;
  last_transaction_status?: "pending" | "completed" | "failed" | null;

  // Ads
  total_ad_points: number;
  total_ad_views: number;
  total_unique_ad_views: number;

  created_at: string;
  transactions: TransactionResponse[] | [];
}

export interface UserResponse {
  id: number;
  // email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  first_name?: string | null;
  last_name?: string | null;
  phone_number: string;
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
    is_protected: boolean | false;
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
  domain_id: number | null;
  owner: {
    id: number;
    // email?: string | null;
    phone_number: string;
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
  password?: string;
  custom_alias?: string | null
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
    is_protected: boolean,
    password: string | null,
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

export type TicketStatus =
  | "open"
  | "in_progress"
  | "answered"
  | "closed";

export type TicketPriority =
  | "low"
  | "medium"
  | "high";


export interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
}

export interface TicketMessage {
  id: number;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export interface TicketDetails extends Ticket {
  user?: UserResponse | null;
  user_full?: AdminUserSummary | null;
  messages: TicketMessage[];
}

export interface CreateTicketPayload {
  subject: string;
  message: string;
  priority: TicketPriority;
}

export interface ReplyTicketPayload {
  message: string;
}

export interface AdminTicket extends Ticket {
  messages?: TicketMessage[];
}

export type LinkType = "url" | "email" | "phone" | "text" | "payment";

export interface BioLinkBase {
  title: string;
  value: string; // لینک اصلی، شماره یا ایمیل
  link_type: LinkType;
  icon?: string | null;
  position?: number | null;
}

export interface BioLinkUpdate {
    title?: string | null;
    value?: string | null;
    link_type: LinkType | null;
    icon?: string | null;
    position?: number | null;
}

export interface BioLinkCreate extends BioLinkBase {}

export interface BioLinkResponse extends BioLinkBase {
  id: number;
  click_count: number;
  is_active: boolean;
}

export interface BioPageBase {
  slug: string;
  title?: string | null;
  description?: string | null;
  avatar_url?: string | null;
}

export interface BioPageCreate extends BioPageBase {
  is_active?: boolean;
  is_public?: boolean;
}
export interface BioPageForm {
  title: string;
  slug: string;
  description?: string;
  avatar?: File | null;
}

export interface BioPageResponse extends BioPageBase {
  id: number;
  is_active: boolean;
  is_public: boolean;
  links: BioLinkResponse[];
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

export interface BioPageUpdate {
  title?: string | null;
  description?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  is_public?: boolean;
}

export interface ToggleLinkActive {
  is_active: boolean;
}