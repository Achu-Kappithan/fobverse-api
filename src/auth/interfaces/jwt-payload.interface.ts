

export interface JwtAccessPayload {
  userId: string;
  email: string;
  is_verified:boolean;
  role:string
}

export interface JwtRefreshPayload {
  userId: string;
}

export interface JwtVerificationPayload {
  email: string;
  userId: string;
}