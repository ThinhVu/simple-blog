import {NextFunction, Request, Response} from 'express';
import DataParser from "../utils/data-parser";
import jwt from 'jsonwebtoken';

export function requireUser(req: Request, res: Response, next: NextFunction) {
   // @ts-ignore
   const jwtToken = req.headers.authorization.split(' ')[1];
   // @ts-ignore
   const decoded = jwt.decode(jwtToken, process.env.SECRET);
   // @ts-ignore
   const expired = Date.now() > decoded.exp * 1000;
   // @ts-ignore
   const user = decoded.user;
   if (!user) return res.status(400).send({error: 'INVALID_USER'})
   if (expired) return res.status(400).send({error: 'EXPIRED_TOKEN'})
   user._id = DataParser.objectId(user._id)
   // @ts-ignore
   req.user = user
   return next()
}
