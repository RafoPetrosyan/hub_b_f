export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: number;
  company_id: number;
  subdomain: string;
  dashboardUrl: string;
  location_id: string | null;
  role: string;
  tfa_mode: boolean;
}

export interface UsersState {
  currentUser: User | null;
  loading: boolean;
}

// Auth API Types
export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: number;
}

export interface OnboardingData {
  id: string;
  user_id: string;
  company_id: string | null;
  current_step: number;
  completed: boolean;
  steps_data: Record<string, any>;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  onboarding: OnboardingData;
  dashboardUrl?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  message: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyRegistrationCodeResponse {
  success: boolean;
}

export interface VerifyRegistrationCodeRequest {
  user_id: string;
  code: string;
}

export interface SendRegistrationVerificationCodeResponse {
  success: boolean;
  message?: string;
}

export interface SendRegistrationVerificationCodeRequest {
  user_id: string;
  method: 'email' | 'phone';
}

export interface SendLoginVerificationCodeResponse {
  success: boolean;
  message?: string;
}

export interface SendLoginVerificationCodeRequest {
  username: string;
  password: string;
}

export interface VerifyLoginCodeResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyLoginCodeRequest {
  username: string;
  password: string;
  code: string;
}

export interface CheckSlugRequest {
  name: string;
}

export interface ForgetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ForgetPasswordRequest {
  username: string;
}

export interface VerifyForgetPasswordCodeResponse {
  resetToken: string;
}

export interface VerifyForgetPasswordCodeRequest {
  username: string;
  code: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  password: string;
  password_confirmation: string;
}
