import _ from 'lodash';
import User, {IUser} from "./user.model";
import {
  createUser,
  getUserPublicInfoById, isUserWithEmailExisted,
  updateUser
} from './user.service';
import {internalError} from "../../utils/controllerUtils";
import PostModel from '../post/post.model';
import {Types} from "mongoose";
import {requireUser} from "../../middlewares/protected-route";
import {AuthRequest, AuthUser} from "../../constants/types";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Request} from 'polka';
import {ServerResponse} from "http";
import cookie from 'cookie';
const polka = require('polka');
const router = polka();
/**
 * Authentication
 */
router.post('/sign-up', async (req: AuthRequest, res: ServerResponse): Promise<any> => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      res.statusCode = 400;
      res.end(JSON.stringify({error: 'MISSING_FIELD: email or password'}))
      return;
    }

    if (await isUserWithEmailExisted(email)) {
      res.statusCode = 400;
      res.end(JSON.stringify({error: 'EMAIL_HAS_BEEN_USED'}))
      return ;
    }

    const username = new Date().getTime().toString();
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await createUser({username, email, password: hashPassword, createdAt: new Date()});
    const authUser : AuthUser = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: authUser}, process.env.SECRET, { expiresIn: '7d' });
    res.setHeader('Set-Cookie',cookie.serialize('token', token,{
      httpOnly: true,
      maxAge:  60 * 60 * 24 * 7
    }))
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({data: {user, token}}))
    //res.cookie('token', token).send({data: {user, token}});
  } catch (e) {
    internalError(e, res);
  }
});
router.post('/sign-in', async (req: AuthRequest, res: ServerResponse): Promise<any> => {
  const {email, password} = req.body;
  const user = await User.findOne({email});

  if (!user) {
    res.statusCode = 400;
    res.end(JSON.stringify({error: 'USER_WITH_EMAIL_NOT_FOUND'}))
    return ;
  }

  const validate = await await bcrypt.compare(password, user.password);
  if (!validate) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'INCORRECT_EMAIL_OR_PASSWORD' }))
    return;
  }
  const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
  const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });
  res.setHeader('Set-Cookie',cookie.serialize('token', token,{
    httpOnly: true,
    maxAge:  60 * 60 * 24 * 7
  }))
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({data: {user: body, token}}))

  //return res.cookie('token', token).send({data: {user: body, token}});
});
router.post('/sign-out', async (req: AuthRequest, res: ServerResponse): Promise<any> => {
  if (req.cookies['token']) {
    return res.clearCookie('token').send({data: {result: true}});
  } else {
    return res.end(JSON.stringify({data: {result: true}}));
  }
});
router.get('/auth', async (req: AuthRequest, res: ServerResponse): Promise<any> => {
  try {
    const jwtToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(jwtToken, process.env.SECRET);
    const expired = Date.now() > decoded.exp * 1000;
    let user = decoded.user;

    if (expired) {
      // jwt expired -> get user info from provided username & password
      user = await User.findOne({ email: user.email, password: user.password }, { _id: 1, email: 1, password: 1, role: 1 });

      // if account password has been changed -> user not found -> token failed to renew -> return error
      if (!user)
        return (res.statusCode = 400, res.end(JSON.stringify({error: 'INVALID_USER'})))
    }

    if (!user)
      return (res.statusCode = 400, res.end(JSON.stringify({error: 'INVALID_USER'})))

    const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });
    return res.cookie('token', token).send({data: {user: body, token}});
  } catch (e) {
    internalError(e, res);
  }
});
/** Users */
router.get('/about/:id', requireUser, async (req: Request, res: ServerResponse): Promise<any> => {
  try {
    let user;
    if (req.params.id === 'me') {
      const authUser = req.user as IUser;
      user = await getUserPublicInfoById(authUser._id);
    } else if (req.params.id) {
      user = await getUserPublicInfoById(new Types.ObjectId(req.params.id));
    } else {
      throw "Missing :id";
    }

    return res.end(JSON.stringify({data: user}));
  } catch (e) {
    internalError(e, res);
  }
});
router.put('/update-profile', requireUser, async (req: Request, res: ServerResponse): Promise<any> => {
  try {
    const {avatar, fullName} = req.body;
    const authUser = req.user as IUser;
    const response = await updateUser(authUser._id, {avatar, fullName});
    const requireRevalidateComputedUser = !_.isEmpty(avatar) || !_.isEmpty(fullName)
    if (requireRevalidateComputedUser)
      PostModel.updateMany({createdBy: authUser._id}, {byUser: _.pick(response, ['_id', 'fullName', 'username', 'avatar'])}).then(console.log).catch(console.error);
    res.end(JSON.stringify({data: response}));
  } catch (e) {
    internalError(e, res);
  }
});

export default router;
