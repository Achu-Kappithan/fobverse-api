import { JwtAccessPayload } from "src/auth/interfaces/jwt-payload.interface";
import { UserDocument } from "src/auth/schema/user.schema";

declare module 'express' {
    interface Request {
        user?:UserDocument
    }
}