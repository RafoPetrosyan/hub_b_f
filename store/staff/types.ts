export type StaffRole = 'business_admin' | 'manager' | 'provider';

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  company_id: number;
  location_id: string | null;
  location_name: string | null;
  status: number;
}

export interface StaffCountResponse {
  business_admin: number;
  manager: number;
  provider: number;
  total: number;
}

export interface GetStaffRequest {
  search?: string;
  location_id?: string;
  role?: StaffRole;
}

export type GetStaffResponse = StaffMember[];

export interface GetStaffByIdRequest {
  id: string;
}

export type GetStaffByIdResponse = StaffMember;

export interface CreateStaffRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  location_id?: string;
}

export type CreateStaffResponse = StaffMember;

export interface UpdateStaffRequest {
  id: string;
  data: Omit<CreateStaffRequest, 'role'> & { role?: StaffRole };
}

export type UpdateStaffResponse = StaffMember;

export interface DeleteStaffRequest {
  id: string;
}

export type DeleteStaffResponse = void;

export interface DeleteStaffMultipleRequest {
  ids: string[];
}

export type DeleteStaffMultipleResponse = void;
