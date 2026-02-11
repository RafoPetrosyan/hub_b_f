export interface Trade {
  id: string;
  name: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deletedAt: string | null;
}

export interface GetTradesResponse extends Array<Trade> {}

export type GetTradesRequest = void;





