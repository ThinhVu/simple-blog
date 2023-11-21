//import {NextFunction, Request, Response} from 'express';
import {UserRole} from '../constants/types';
import jwt from 'jsonwebtoken';
import {ServerResponse} from "http";
import {Request, Next} from 'polka';
//remove Request, Response, NextFunction in line 5 and 16
export function requireUser(req: Request, res: ServerResponse, next: Next) {
   const jwtToken = req.headers.authorization.split(' ')[1];
   const decoded = jwt.decode(jwtToken, process.env.SECRET);
   const expired = Date.now() > decoded.exp * 1000;
   const user = decoded.user;
   if (!user) {
      res.statusCode = 400;
      res.end(JSON.stringify({error: 'INVALID_USER'}))
      return;
   }
   if (expired) {
      res.statusCode = 400;
      res.end(JSON.stringify({error: 'EXPIRED_TOKEN'}))
      return;
   }
   req.user = user
   return next()
}

export function requireAdmin(req: Request, res: ServerResponse, next: Next) {
   requireUser(req, res, () => {
      // @ts-ignore
      if (req.user.role !== UserRole.Admin) {
        res.statusCode = 401;
        res.end(JSON.stringify({error: 'UNAUTHORIZED'}));
        return;
      }
      return next()
   })
}
