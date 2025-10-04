import { apiClient } from "./api";

export interface LoginResponse {
  token: string;
  token_type: string;
}

export interface RegisterResponse {
  message: string;
  otpauth_uri: string;
}

export interface Verify2FAResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
  },

  async register(
    username: string,
    password: string
  ): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>("/auth/register", {
      username,
      password,
    });
  },

  async verify2FA(
    pre2faToken: string,
    totpCode: string
  ): Promise<Verify2FAResponse> {
    return apiClient.post<Verify2FAResponse>("/auth/verify-2fa", {
      pre2fa_token: pre2faToken,
      totp_code: totpCode,
    });
  },
};
