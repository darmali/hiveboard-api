// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      userId?: Number;
      cleanBody?: any;
      role: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      company: object;
      rawBody?: Buffer;
    }
  }
}
