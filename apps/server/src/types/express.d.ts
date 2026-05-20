import { AdminJwtPayload, CustomerJwtPayload } from '../app/auth/interfaces/jwt-payload.interface';

declare module 'express' {
  interface Request {
    admin?: AdminJwtPayload;
    customer?: CustomerJwtPayload;
  }
}
