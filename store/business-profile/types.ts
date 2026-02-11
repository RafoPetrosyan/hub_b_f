export interface AccountInfo {
  first_name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  tfa_mode?: boolean;
  profile_picture?: string | null;
  logo?: string | null;
}

export interface PutAccountInfoReq {
  first_name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  logo?: string | null;
}

export interface PutAccountInfoRes extends AccountInfo {}

export interface PostTwoFactorReq {
  mode: boolean;
}

export interface PostTwoFactorRes {
  mode?: boolean;
}

export interface CompanyInfo {
  name: string;
  country: string;
  timezone: string;
  phone?: string;
  email?: string;
  currency?: string;
  legal_name?: string;
  dba_name?: string;
  entity_type?: string;
  registration_number?: string;
  ein?: string;
  logo?: string | null;
}

export interface AddressInfo {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CompanyProfileResponse {
  account?: {
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    profile_picture?: string | null;
  };
  company: {
    id?: number;
    business_name: string;
    subdomain?: string;
    status?: string;
    country: string;
    timezone: string;
    phone?: string;
    email?: string;
    currency?: string;
    legal_name?: string;
    dba_name?: string;
    entity_type?: string;
    registration_number?: string;
    ein?: string;
    logo?: string | null;
  };
  address: AddressInfo;
}

export interface CompanyProfileRequest {
  account?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    tfa_mode?: boolean;
    profile_picture?: string;
  };
  company: {
    business_name: string;
    country: string;
    timezone: string;
    phone?: string;
    email?: string;
    currency?: string;
    logo?: string;
    legal_name?: string;
    dba_name?: string;
    entity_type?: string;
    registration_number?: string;
    ein?: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface OnboardingResponse {
  id: string;
  user_id: string;
  company_id: string;
  current_step: number;
  completed: boolean;
  steps_data: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
