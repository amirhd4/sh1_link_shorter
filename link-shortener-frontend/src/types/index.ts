export interface Ad {
  id: number;
  title: string;
  media_type: string;
  media_url: string;
  target_url?: string;
  is_active: boolean;
  duration: number;
  created_at: string;
}

export type AdCreate = Omit<Ad, 'id' | 'created_at'>;

export type AdUpdate = Partial<AdCreate>;

export interface AdStatsPerLink {
  short_code: string;
  long_url: string;
  total_views: number;
  total_points: number;
}

export interface AdStatsPerUser {
  user_id: number;
  user: string;
  total_views: number;
  total_points: number;
}
