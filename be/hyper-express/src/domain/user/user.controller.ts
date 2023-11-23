import _ from 'lodash';
import {Response} from 'hyper-express';
import User, {IUser} from "./user.model";
import {
  createUser, getAuthUserByEmail,
  getUserPublicInfoById, isUserWithEmailExisted, updatePassword,
  updateUser, updateUserResetPasswordToken
} from './user.service';
import {internalError} from "../../utils/controllerUtils";
import PostModel from '../post/post.model';
import {Types} from "mongoose";
import {requireUser} from "../../middlewares/protected-route";
import {AuthRequest, AuthUser} from "../../constants/types";
import {EmailRegex} from "../../constants/regex";
import {generateRandomCode} from "../../utils/commonUtils";
import {sendEmail} from "../../utils/email";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Router} from 'hyper-express';

const router = new Router();

/**
 * Authentication
 */
router.post('/can-use-email', async (req: AuthRequest, res:Response): Promise<any> => {
  try {
    const {email} = await req.json();
    if (!email) {
      return res.status(400).json({error: 'MISSING_FIELD: email'})
    }
    if (!email.match(EmailRegex)) {
      return res.status(400).json({error: 'INVALID_EMAIL_FORMAT'});
    }

    if (await isUserWithEmailExisted(email)) {
      return res.status(400).json({error: 'EMAIL_HAS_BEEN_USED'});
    }
    const data = {result: true};
    const jsonData = JSON.stringify(data);
    return res.send(jsonData);
  } catch (e) {
    internalError(e, res);
  }
});
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
router.post('/change-password', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const {email, password, newPassword} = await req.json();
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({error: 'INCORRECT_EMAIL_OR_PASSWORD'});
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({error: 'INCORRECT_EMAIL_OR_PASSWORD'});
    }
    await User.updateOne({email}, { password: newPasswordHash });
    res.status(204).end();
  } catch (e) {
    internalError(e, res);
  }
});
router.post('/forgot-password', async (req: AuthRequest, res: Response): Promise<any> => {
  const {email} = await req.json();

  const user = await getAuthUserByEmail(email);
  if (!user) {
    return res.status(400).json({error: 'USER_WITH_EMAIL_NOT_FOUND'});
  }

  const resetPasswordCode = generateRandomCode(6);
  await updateUserResetPasswordToken(user._id, resetPasswordCode);

  const greeting = `Hey "${user.fullName || user.email}"`;
  const description = `We received a request to reset your password. The reset password code is "${resetPasswordCode}".\r\nIf you do not make this request, you can safely ignore this message.`;

  try {
    await sendEmail({
      to: email,
      subject: 'Reset Password Request',
      html: `
<!doctype html>
<html>
   <head>
      <meta name="viewport" content="width=device-width">
   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
   <title>Reset password code</title>
   </head>
   <body>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px; Margin-top: 20px;">${greeting},</p>
    <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">${description}</p>
    </body>
</html>
`,
    });
    return res.send(JSON.stringify({ data: true }));
  } catch (e) {
    internalError(e, res);
  }
});
router.post('/reset-password', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const {password, code, email} = await req.json();
    const user = await getAuthUserByEmail(email);

    if (!user) {
      return res.status(400).json({error: 'USER_WITH_EMAIL_NOT_FOUND'});
    }

    if (user.resetPasswordToken !== code ) {
      return res.status(400).json({error: 'Invalid reset code.'});
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updatePassword(user._id, passwordHash);

    const body = {_id: user._id, email: user.email, password: passwordHash};
    const authToken = jwt.sign({user: body}, process.env.SECRET);
    return res.cookie('token', authToken).send(JSON.stringify({data: {user, token: authToken}}));
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
