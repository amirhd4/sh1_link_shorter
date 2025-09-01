export interface UserResponse {
  id: number;
  email: string;
  role: 'user' | 'admin'; // <<<< فیلد role اضافه شد
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  plan?: { // تایپ پلن را هم برای کامل بودن اضافه می‌کنیم
    id: number;
    name: string;
  } | null;
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
}

export interface URLResponse {
  long_url: string;
  short_url: string;
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