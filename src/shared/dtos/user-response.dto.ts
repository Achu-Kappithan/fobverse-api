export class CurrentUserDto {
  id: string;
  role: string;
  email: string;
  name?: string;
  is_verified: boolean;
  profileImg?: string;
  message: string;
}
