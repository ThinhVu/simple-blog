import {UserRole} from '../constants/types';
import {IUser} from "../domain/user/user.model";
import {MiddlewareNext, Request, Response} from "hyper-express";
import jwt from 'jsonwebtoken';

export function requireUser(req: Request, res: Response, next: MiddlewareNext) {
   const jwtToken = req.headers.authorization.split(' ')[1];
   const decoded = jwt.verify(jwtToken, process.env.SECRET) as {exp: number, user: IUser};
   const expired = Date.now() > decoded.exp * 1000;
   const user = decoded.user;
   if (!user) return next(new Error('INVALID_USER'))
   if (expired) return next(new Error('EXPIRED_TOKEN'))
   // @ts-ignore
   req.user = user
   return next()
}

export function requireAdmin(req: Request, res: Response, next: MiddlewareNext) {
   requireUser(req, res, () => {
      // @ts-ignore
      if (req.user.role !== UserRole.Admin)
         return next(new Error('UNAUTHORIZED'))
      return next()
   })
}
