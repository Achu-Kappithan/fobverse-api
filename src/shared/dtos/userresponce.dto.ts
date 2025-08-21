export class CurrentUserDto {
  id: string;
  role: string;
  email: string;
  is_verified: boolean;
  profileImg?: string;
  message: string;
}
