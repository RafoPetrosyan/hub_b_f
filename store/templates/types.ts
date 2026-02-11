export interface TemplateVariable {
  id: string;
  key: string;
  label: string;
  description: string;
  required: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateType {
  id: string;
  key: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  variables?: TemplateVariable[];
}

export interface BaseTemplate {
  id: string;
  type_id: string;
  name: string;
  provider: 'email' | 'sms' | 'push';
  title: string;
  body: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  type?: TemplateType;
}

export interface NotificationTemplate {
  id: string;
  company_id?: number;
  name: string;
  provider: 'email' | 'sms' | 'push';
  title: string;
  body: string;
  base_template_id?: string;
  created_by?: string;
  last_sync_date?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  base_template?: BaseTemplate;
  variables?: TemplateVariable[];
}

export interface GetTemplatesResponse extends Array<NotificationTemplate> {}

export type GetTemplatesRequest = void;

export interface UpdateTemplateRequest {
  id: string;
  title: string;
  body: string;
}

export interface UpdateTemplateResponse {
  template: NotificationTemplate;
}

export interface ResetTemplateRequest {
  id: string;
}

export interface ResetTemplateResponse {
  template: NotificationTemplate;
}

export interface GetTemplateVariablesRequest {
  type: string;
}

export interface GetTemplateVariablesResponse extends Array<TemplateVariable> {}

export interface GetTemplateRequest {
  id: string;
}

export interface GetTemplateResponse extends NotificationTemplate {}

