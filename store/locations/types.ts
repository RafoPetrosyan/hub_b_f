export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  timezone: string;
}

export interface Break {
  start: string;
  end: string;
}

export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  breaks: Break[];
}

export interface LocationAPI {
  id?: string;
  name: string;
  is_primary: boolean;
  address: Address;
  working_hours: WorkingHour[];
  trades: number[];
}

export interface Trade {
  id: number;
  name: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationResponse {
  id: string;
  name: string;
  is_primary: boolean;
  address: Address;
  working_hours: WorkingHour[];
  trades: Trade[];
}

export type GetLocationsResponse = LocationResponse[];

export type GetLocationRequest = {
  id: string;
};

export type GetLocationResponse = LocationResponse;

export type CreateLocationRequest = Omit<LocationAPI, 'id'>;

export type CreateLocationResponse = LocationResponse;

export type UpdateLocationRequest = {
  id: string;
  data: Omit<LocationAPI, 'id'>;
};

export type UpdateLocationResponse = LocationResponse;

export type DeleteLocationRequest = {
  id: string;
};

export type DeleteLocationResponse = void;
