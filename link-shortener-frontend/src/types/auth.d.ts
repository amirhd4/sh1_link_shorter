export interface LoginCredentials {
  email: string;
  password: string;
}

export type RegisterCredentials = LoginCredentials;


export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}


export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}