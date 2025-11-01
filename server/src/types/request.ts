import { Request, Response } from 'express';

export type TypedRequestHandler<T = any> = (
  req: Request & T,
  res: Response
) => Promise<void> | void;

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}