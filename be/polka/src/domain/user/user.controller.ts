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
import {AuthUser} from "../../constants/types";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import polka from 'polka';

const router = polka();
/**
 * Authentication
 */
router.post('/sign-up', async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) return res.status(400).json({error: 'MISSING_FIELD: email or password'})
    if (await isUserWithEmailExisted(email)) return res.status(400).json({error: 'EMAIL_HAS_BEEN_USED'})
    const username = new Date().getTime().toString();
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await createUser({username, email, password: hashPassword, createdAt: new Date()});
    const authUser : AuthUser = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: authUser}, process.env.SECRET, { expiresIn: '7d' });
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.cookie('token', token).json({user, token})
  } catch (e) {
    internalError(e, res);
  }
});
router.post('/sign-in', async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if (!user) return res.status(400).json({error: 'USER_WITH_EMAIL_NOT_FOUND'})
  const validate = await bcrypt.compare(password, user.password);
  if (!validate) return res.status(400).json({ error: 'INCORRECT_EMAIL_OR_PASSWORD' })
  const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
  const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });
  return res.cookie('token', token).json({user: body, token})
});
router.post('/sign-out', async (req, res) => {
  if (req.cookies['token']) {
    res.clearCookie('token')
  }
  res.json(true)
});
router.get('/auth', async (req, res) => {
  try {
    const jwtToken = req.headers.authorization.split(' ')[1];
    const {user} = jwt.verify(jwtToken, process.env.SECRET);
    if (!user) return res.status(400).json({error: 'INVALID_USER'})
    const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });
    return res.cookie('token', token).json({user: body, token})
  } catch (e) {
    internalError(e, res);
  }
});
/** Users */
router.get('/about/:id', requireUser, async (req, res) => {
  try {
    let user;
    if (req.params.id === 'me') {
      // @ts-ignore
      const authUser = req.user as IUser;
      user = await getUserPublicInfoById(authUser._id);
    } else if (req.params.id) {
      user = await getUserPublicInfoById(new Types.ObjectId(req.params.id));
    } else {
      throw "Missing :id";
    }
    return res.json(user)
  } catch (e) {
    internalError(e, res);
  }
});
router.put('/update-profile', requireUser, async (req, res) => {
  try {
    const {avatar, fullName} = req.body;
    // @ts-ignore
    const authUser = req.user as IUser;
    const response = await updateUser(authUser._id, {avatar, fullName});
    const requireRevalidateComputedUser = !_.isEmpty(avatar) || !_.isEmpty(fullName)
    if (requireRevalidateComputedUser)
      PostModel.updateMany({createdBy: authUser._id}, {byUser: _.pick(response, ['_id', 'fullName', 'username', 'avatar'])}).then(console.log).catch(console.error);
    res.json(response)
  } catch (e) {
    internalError(e, res);
  }
});

export default router;
