import _ from 'lodash';
import {Response} from 'hyper-express';
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
import {Router} from 'hyper-express';

const router = new Router();

/**
 * Authentication
 */
router.post('/sign-up', async (req: AuthRequest, res:Response): Promise<any> => {
  try {
    const {email, password} = await req.json();

    if (!email || !password) {
      return res.status(400).json({error: 'MISSING_FIELD: email or password'});
    }

    if (await isUserWithEmailExisted(email)) {
      return res.status(400).json({error: 'EMAIL_HAS_BEEN_USED'});
    }

    const username = new Date().getTime().toString();
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await createUser({username, email, password: hashPassword, createdAt: new Date()});
    const authUser : AuthUser = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: authUser}, process.env.SECRET, { expiresIn: '7d' });
    res.cookie('token', token).send(JSON.stringify({data: {user, token}}));
  } catch (e) {
    internalError(e, res);
  }
});
router.post('/sign-in', async (req: AuthRequest, res: Response): Promise<any> => {
  const {email, password} = await req.json();
  const user = await User.findOne({email});

  if (!user) {
    return res.status(400).json({ error: 'USER_WITH_EMAIL_NOT_FOUND'})
  }

  const validate = await bcrypt.compare(password, user.password)
  if (!validate) {
    return res.status(400).json({ error: 'INCORRECT_EMAIL_OR_PASSWORD' })
  }

  const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
  const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });

  return res.cookie('token', token).send(JSON.stringify({data: {user: body, token}}));
});
router.post('/sign-out', async (req: AuthRequest, res): Promise<any> => {
  if (req.cookies['token']) {
    return res.clearCookie('token').send(JSON.stringify({data: {result: true}}));
  } else {
    return res.send(JSON.stringify({data: {result: true}}));
  }
});
router.get('/auth', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const jwtToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(jwtToken, process.env.SECRET) as {exp: number, user: IUser};
    const expired = Date.now() > decoded.exp * 1000;
    let user = decoded.user;

    if (expired) {
      // jwt expired -> get user info from provided username & password
      user = await User.findOne({ email: user.email, password: user.password }, { _id: 1, email: 1, password: 1, role: 1 });

      // if account password has been changed -> user not found -> token failed to renew -> return error
      if (!user)
        return res.status(400).json({error: 'INVALID_USER'})
    }

    if (!user)
      return res.status(400).json({error: 'INVALID_USER'})

    const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });
    return res.cookie('token', token).send(JSON.stringify({data: {user: body, token}}));
  } catch (e) {
    internalError(e, res);
  }
});
/** Users */
router.get('/about/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    let user;
    if (req.params.id === 'me') {
      const authUser = req.user as IUser;
      user = await getUserPublicInfoById(authUser._id);
    } else if (req.path_parameters.id) {
      user = await getUserPublicInfoById(new Types.ObjectId(req.path_parameters.id));
    } else {
      throw "Missing :id";
    }

    return res.send(JSON.stringify({data: user}));
  } catch (e) {
    internalError(e, res);
  }
});
router.put('/update-profile', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const {avatar, fullName} = await req.json();
    const authUser = req.user as IUser;
    const response = await updateUser(authUser._id, {avatar, fullName});
    const requireRevalidateComputedUser = !_.isEmpty(avatar) || !_.isEmpty(fullName)
    if (requireRevalidateComputedUser)
      PostModel.updateMany({createdBy: authUser._id}, {byUser: _.pick(response, ['_id', 'fullName', 'username', 'avatar'])}).then(console.log).catch(console.error);
    res.send(JSON.stringify({data: response}));
  } catch (e) {
    internalError(e, res);
  }
});

export default router;
