import {NextFunction, Request, Response} from 'express';
import {UserRole} from '../constants/types';
import jwt from 'jsonwebtoken';

export function requireUser(req: Request, res: Response, next: NextFunction) {
   const jwtToken = req.headers.authorization.split(' ')[1];
   const decoded = jwt.decode(jwtToken, process.env.SECRET);
   const expired = Date.now() > decoded.exp * 1000;
   const user = decoded.user;
   if (!user) return res.status(400).send({error: 'INVALID_USER'})
   if (expired) return res.status(400).send({error: 'EXPIRED_TOKEN'})
   req.user = user
   return next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
   requireUser(req, res, () => {
      // @ts-ignore
      if (req.user.role !== UserRole.Admin)
         return res.status(401).json({error: 'UNAUTHORIZED'})
      return next()
   })
}
