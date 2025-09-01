export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
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