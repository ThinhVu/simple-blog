import _ from 'lodash';
import {Request} from 'express';
import {IUser} from "./user.model";
import {
  createUser,
  getUserPublicInfoById, isUserWithEmailExisted,
  updateUser
} from './user.service';
import {internalError} from "../../utils/controllerUtils";
import {requireUser} from "../../middlewares/protected-route";
import jwt from 'jsonwebtoken';
import express from "express";
import {ObjectId} from "bson";
import {Model, mongoCtx} from "../../utils/mongoCtx";

const router = express.Router()

/**
 * Authentication
 */
router.post('/sign-up', mongoCtx(async (req: any, res: any): Promise<any> => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({error: 'MISSING_FIELD: email or password'});
    }

    if (await isUserWithEmailExisted(email)) {
      return res.status(400).json({error: 'EMAIL_HAS_BEEN_USED'});
    }

    const username = new Date().getTime().toString();
    const user = await createUser({username, email, password, createdAt: new Date()});
    const authUser = {_id: user._id, email: user.email, password: user.password, role: user.role}
    // @ts-ignore
    const token = jwt.sign({user: authUser}, process.env.SECRET, { expiresIn: '7d' });
    res.cookie('token', token).json({user, token});
  } catch (e: any) {
    internalError(e, res);
  }
}));
router.post('/sign-in', mongoCtx(async (req: any, res: any): Promise<any> => {
  const {email, password} = req.body;
  const user = await Model('User').findOne({email, password});

  if (!user) {
    return res.status(400).json({error: 'USER_WITH_EMAIL_NOT_FOUND'});
  }

  const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
  // @ts-ignore
  const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });

  return res.cookie('token', token).json({user: body, token});
}));
router.post('/sign-out', mongoCtx(async (req: any, res: any): Promise<any> => {
  if (req.cookies['token']) {
    res.clearCookie('token')
  }
  res.json(true)
}));
router.get('/auth', mongoCtx(async (req: any, res: any): Promise<any> => {
  try {
    // @ts-ignore
    const jwtToken = req.headers.authorization.split(' ')[1];
    // @ts-ignore
    const {user} = jwt.verify(jwtToken, process.env.SECRET);
    // @ts-ignore
    if (!user) return res.status(400).json({error: 'INVALID_USER'})
    const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
    // @ts-ignore
    const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });
    return res.cookie('token', token).json({user: body, token});
  } catch (e: any) {
    internalError(e, res);
  }
}));
/** Users */
router.get('/about/:id', requireUser, mongoCtx(async (req: Request, res: any): Promise<any> => {
  try {
    let user;
    if (req.params.id === 'me') {
      // @ts-ignore
      const authUser = req.user as IUser;
      user = await getUserPublicInfoById(authUser._id);
    } else if (req.params.id) {
      user = await getUserPublicInfoById(new ObjectId(req.params.id));
    } else {
      throw "Missing :id";
    }

    return res.json(user);
  } catch (e: any) {
    internalError(e, res);
  }
}));
router.put('/update-profile', requireUser, mongoCtx(async (req: Request, res: any): Promise<any> => {
  try {
    const {avatar, fullName} = req.body;
    // @ts-ignore
    const authUser = req.user as IUser;
    const response = await updateUser(authUser._id, {avatar, fullName});
    const requireRevalidateComputedUser = !_.isEmpty(avatar) || !_.isEmpty(fullName)
    if (requireRevalidateComputedUser)
      Model('Post').updateMany({createdBy: authUser._id}, {byUser: _.pick(response, ['_id', 'fullName', 'username', 'avatar'])}).then(console.log).catch(console.error);
    res.json(response);
  } catch (e: any) {
    internalError(e, res);
  }
}));

export default router;
