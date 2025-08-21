import { UserDocument } from 'src/auth/schema/user.schema';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDocument;
  }
}
