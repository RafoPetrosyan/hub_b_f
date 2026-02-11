export interface SubscriptionPlanBenefit {
  id: string;
  title: string;
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_cents: string | number;
  currency: string;
  duration_unit: 'month' | 'year';
  duration_value: number;
  is_trending: boolean;
  is_active: boolean;
  benefits?: SubscriptionPlanBenefit[];
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPlansResponse {
  month: SubscriptionPlan[];
  year: SubscriptionPlan[];
}

export type GetSubscriptionPlansRequest = void;

export type GetSubscriptionPlansResponse = SubscriptionPlansResponse;

export interface Step5Dto {
  card_number: string;
  cvc: string;
  cardholder_name: string;
  exp_month: string;
  exp_year: string;
  accept_terms: boolean;
  address: string;
  period: 'monthly' | 'yearly';
}

export interface OnboardingStepRequest {
  step: number;
  subscription_id?: string;
  addon_ids?: string[];
  tier_id?: string;
  // Step 5 payment data
  card_number?: string;
  cvc?: string;
  cardholder_name?: string;
  exp_month?: string;
  exp_year?: string;
  accept_terms?: boolean;
  address?: string;
  period?: 'monthly' | 'yearly';
  // Step 6 email verification
  verification_code?: string;
  // Step 7 trades
  selected_ids?: string[];
  other_trades?: string[];
  // Step 9 services
  other_services?: string[];
  services?: Array<{
    name: string;
    specialization_name: string;
    price_in_cents: number;
  }>;
  // Step 10 offerings
  has_schedule?: boolean;
  has_education?: boolean;
  has_products?: boolean;
  // Step 8 business info
  business_name?: string;
  logo_url?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  // Step 11 location type
  type?: 'mobile' | 'virtual' | 'studio';
  studio_address?: string;
  // Step 11 team members
  team?: Array<{
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'provider';
  }>;
  // Step 12 platform customization
  template_id?: string;
  color_palette_id?: string;
  font_id?: string;
}

export type OnboardingStepResponse = void;

export interface OnboardingStepData {
  subscription_id?: string;
  addon_ids?: string[];
  [key: string]: any;
}

export interface OnboardingData {
  id: string;
  user_id: string;
  company_id: string;
  current_step: number;
  completed: boolean;
  steps_data: {
    [key: string]: OnboardingStepData;
  };
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type GetOnboardingRequest = void;

export type GetOnboardingResponse = OnboardingData;

export interface PlanPrice {
  id: string;
  plan_option_id: string;
  interval: 'monthly' | 'yearly';
  price_cents: string;
  currency: string;
  stripe_price_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlanBenefitChild {
  name: string;
}

export interface PlanBenefit {
  name: string;
  children: PlanBenefitChild[];
}

export interface PlanOption {
  id: string;
  tier_id: string;
  key: string;
  name: string;
  description: string;
  benefits: PlanBenefit[];
  extra_practitioner_price_cents: string | null;
  website_included: boolean;
  website_price_monthly_cents: string | null;
  website_price_yearly_cents: string | null;
  educator_upgrade_monthly_cents: string | null;
  stripe_product_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prices: PlanPrice[];
}

export interface OnboardingTier {
  id: string;
  key: string;
  name: string;
  description: string;
  max_users: number | null;
  max_locations: number | null;
  benefits: PlanBenefit[];
  created_at: string;
  updated_at: string;
  plan: PlanOption;
}

export type GetOnboardingTiersRequest = void;

export type GetOnboardingTiersResponse = OnboardingTier[];

export interface AvailablePlan {
  id: string;
  tier_id: string;
  key: string;
  name: string;
  description: string;
  benefits: PlanBenefit[];
  extra_practitioner_price_cents: string | null;
  website_included: boolean;
  website_price_monthly_cents: string | null;
  website_price_yearly_cents: string | null;
  educator_upgrade_monthly_cents: string | null;
  stripe_product_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prices: PlanPrice[];
  tier: OnboardingTier;
}

export type GetAvailablePlansRequest = void;

export type GetAvailablePlansResponse = AvailablePlan[];

export interface AddonBenefit {
  name: string;
}

export interface AvailableAddon {
  id: string;
  name: string;
  description: string;
  detailed_description: string;
  best_for: string;
  benefits: AddonBenefit[];
  slug: string;
  price_cents: string;
  currency: string;
  stripe_product_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type GetAvailableAddonsRequest = void;

export type GetAvailableAddonsResponse = AvailableAddon[];

export interface PlanSummaryTier {
  id: string;
  key: string;
  name: string;
  description: string;
  max_users: number | null;
  max_locations: number | null;
  benefits: PlanBenefit[];
  created_at: string;
  updated_at: string;
}

export interface PlanSummaryPlan {
  id: string;
  tier_id: string;
  key: string;
  name: string;
  description: string;
  benefits: PlanBenefit[];
  extra_practitioner_price_cents: string | null;
  website_included: boolean;
  website_price_monthly_cents: string | null;
  website_price_yearly_cents: string | null;
  educator_upgrade_monthly_cents: string | null;
  stripe_product_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prices: PlanPrice[];
  tier?: PlanSummaryTier;
}

export interface PlanSummaryAddonItem {
  id: string;
  plan_option_id: string;
  addon_id: string;
  included: boolean;
  price_cents: string;
  currency: string;
  stripe_price_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  addon: AvailableAddon;
}

export interface PlanSummarySelection {
  plan: PlanSummaryPlan;
  has_website: boolean;
  additional_practitioners: number;
  selected_addon_ids: string[];
  enabled_addon_ids: string[];
}

export interface PlanSummaryResponse {
  plan: PlanSummaryPlan;
  add_ons: PlanSummaryAddonItem[];
  selection: PlanSummarySelection;
}

export type GetPlanSummaryRequest = void;

export type GetPlanSummaryResponse = PlanSummaryResponse;

export interface PaymentIntentsResponse {
  subscription_id: string;
  intent_id: string;
  intent_type: string;
  client_secret: string;
}

export interface GetPaymentIntentsRequest {
  period: 'monthly' | 'yearly';
}

export type GetPaymentIntentsResponse = PaymentIntentsResponse;

export interface AvailableTrade {
  id: number;
  name: string;
}

export interface AvailableTradeCategory {
  id: string;
  name: string;
  trades: AvailableTrade[];
}

export type GetAvailableTradesRequest = void;

export type GetAvailableTradesResponse = AvailableTradeCategory[];

export interface AvailableService {
  id: string;
  name: string;
  duration_minutes: number;
  trade_id: number;
  specialization_id: string;
}

export interface AvailableSpecialization {
  id: string;
  name: string;
  trade_id: number;
  services: AvailableService[];
}

export type GetAvailableServicesRequest = void;

export type GetAvailableServicesResponse = AvailableSpecialization[];

export interface OnboardingLinksResponse {
  dashboard_url: string;
  booking_url: string;
  embed_url: string;
}

export type GetOnboardingLinksRequest = void;

export type GetOnboardingLinksResponse = OnboardingLinksResponse;
