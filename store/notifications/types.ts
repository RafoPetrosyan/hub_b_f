export interface NotificationSettings {
  email: boolean;
  phone: boolean;
  push: boolean;
}

export interface Notification {
  id: string;
  name: string;
  alias: string;
  description: string;
  settings: NotificationSettings;
}

export interface Category {
  id: string;
  title: string;
  notifications: Notification[];
}

export interface MasterSettings {
  enabled: boolean;
  digest_frequency: string;
  quiet_hours: Array<{
    day: string;
    start: string;
    end: string;
  }> | null;
}

export interface GetNotificationSettingsResponse {
  master: MasterSettings;
  categories: Category[];
}

export type GetNotificationSettingsRequest = void;

export interface UpdateNotificationSettingRequest {
  alias: string;
  email: boolean;
  phone: boolean;
  push: boolean;
}

export interface UpdateNotificationSettingResponse {
  success: boolean;
}

export interface UpdateMasterSettingsRequest {
  enabled: boolean;
}

export interface UpdateMasterSettingsResponse {
  success: boolean;
}

export interface UpdateGlobalSettingsRequest {
  digest_frequency: string;
  quiet_hours?: Array<{
    day: string;
    start: string;
    end: string;
  }> | null;
}

export interface UpdateGlobalSettingsResponse {
  success: boolean;
}




