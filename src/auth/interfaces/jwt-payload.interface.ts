export interface JwtAccessPayload {
  UserId: string;
  email: string;
  role: string;
  profileId?: string;
  name?: string;
}

export interface JwtRefreshPayload {
  UserId: string;
  email: string;
}

export interface JwtVerificationPayload {
  email: string;
  UserId: string;
}

export interface passwordResetPayload {
  id: string;
  email: string;
  role: string;
}
