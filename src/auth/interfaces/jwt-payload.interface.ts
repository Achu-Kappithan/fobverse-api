export interface JwtAccessPayload {
  userId: string;
  email: string;
  is_verified: boolean;
  role: string;
}

export interface JwtRefreshPayload {
  userId: string;
  email: string;
}

export interface JwtVerificationPayload {
  email: string;
  userId: string;
}

export interface passwordResetPayload {
  id:string;
  email:string;
  role:string
}
