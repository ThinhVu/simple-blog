import jwt from 'jsonwebtoken';
import {AuthRequest} from "../constants/types";

export function requireUser(req: AuthRequest, res, next) {
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