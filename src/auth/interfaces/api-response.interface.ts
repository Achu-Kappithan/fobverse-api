import { ResponseRegisterDto } from "../dto/response.dto";
import { UserDocument } from "../schema/user.schema";

export interface LoginResponce {
  accessToken: string;
  refreshToken: string;
  data: ResponseRegisterDto | null;
}

export interface RegisterResponce {
  user: UserDocument;
  message: string;
  verificationToken?: string;
}

export interface verificatonResponce {
  message: string;
  user: UserDocument;
}

export interface tokenresponce {
  newAccess: string;
  message: string;
}

export interface generalResponce {
  message:string
}
