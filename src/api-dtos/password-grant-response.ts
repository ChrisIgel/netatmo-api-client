import { BaseTokenResponse } from './base-token-response';

export interface PasswordGrantResponse extends BaseTokenResponse {
  scope: string[];
  expire_in: number;
}
