import _ from 'lodash';
import {Request} from 'express';
import {IUser} from "./user.model";
import {
  createUser, getAuthUserByEmail,
  getUserPublicInfoById, isUserWithEmailExisted, updatePassword,
  updateUser, updateUserResetPasswordToken
} from './user.service';
import {internalError} from "../../utils/controllerUtils";
import {requireUser} from "../../middlewares/protected-route";
import {EmailRegex} from "../../constants/regex";
import {generateRandomCode} from "../../utils/commonUtils";
import {sendEmail} from "../../utils/email";
import jwt from 'jsonwebtoken';
import express from "express";
import {ObjectId} from "bson";
import {Model, mongoCtx} from "../../utils/mongoCtx";

const router = express.Router()

/**
 * Authentication
 */
router.get('/can-use-email', mongoCtx(async (req: any, res: any): Promise<any> => {
  try {
    const {email} = req.query as {email: string};
    if (!email) {
      return res.status(400).send({error: 'MISSING_FIELD: email'});
    }
    if (!email.match(EmailRegex)) {
      return res.status(400).send({error: 'INVALID_EMAIL_FORMAT'});
    }

    if (await isUserWithEmailExisted(email)) {
      return res.status(400).send({error: 'EMAIL_HAS_BEEN_USED'});
    }
    return res.send({data: {result: true}});
  } catch (e: any) {
    internalError(e, res);
  }
}));
router.post('/sign-up', mongoCtx(async (req: any, res: any): Promise<any> => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).send({error: 'MISSING_FIELD: email or password'});
    }

    if (await isUserWithEmailExisted(email)) {
      return res.status(400).send({error: 'EMAIL_HAS_BEEN_USED'});
    }

    const username = new Date().getTime().toString();
    const user = await createUser({username, email, password, createdAt: new Date()});
    const authUser = {_id: user._id, email: user.email, password: user.password, role: user.role}
    // @ts-ignore
    const token = jwt.sign({user: authUser}, process.env.SECRET, { expiresIn: '7d' });
    res.cookie('token', token).send({data: {user, token}});
  } catch (e: any) {
    internalError(e, res);
  }
}));
router.post('/sign-in', mongoCtx(async (req: any, res: any): Promise<any> => {
  const {email, password} = req.body;
  const user = await Model('User').findOne({email, password});

  if (!user) {
    return res.status(400).send({error: 'USER_WITH_EMAIL_NOT_FOUND'});
  }

  const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
  // @ts-ignore
  const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });

  return res.cookie('token', token).send({data: {user: body, token}});
}));
router.post('/sign-out', mongoCtx(async (req: any, res: any): Promise<any> => {
  if (req.cookies['token']) {
    return res.clearCookie('token').send({data: {result: true}});
  } else {
    return res.send({data: {result: true}});
  }
}));
router.get('/auth', mongoCtx(async (req: any, res: any): Promise<any> => {
  try {
    // @ts-ignore
    const jwtToken = req.headers.authorization.split(' ')[1];
    // @ts-ignore
    const decoded = jwt.decode(jwtToken, process.env.SECRET);
    // @ts-ignore
    const expired = Date.now() > decoded.exp * 1000;
    // @ts-ignore
    let user = decoded.user;

    if (expired) {
      // jwt expired -> get user info from provided username & password
      user = await Model('User').findOne({ email: user.email, password: user.password }, { _id: 1, email: 1, password: 1, role: 1 });

      // if account password has been changed -> user not found -> token failed to renew -> return error
      if (!user)
        return res.status(400).send({error: 'INVALID_USER'})
    }

    if (!user)
      return res.status(400).send({error: 'INVALID_USER'})

    const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
    // @ts-ignore
    const token = jwt.sign({user: body}, process.env.SECRET, { expiresIn: '7d' });
    return res.cookie('token', token).send({data: {user: body, token}});
  } catch (e: any) {
    internalError(e, res);
  }
}));
router.post('/change-password', mongoCtx(async (req: any, res: any): Promise<any> => {
  try {
    const {email, password, newPassword} = req.body;
    const user = await Model('User').findOne({email, password});
    if (!user) {
      return res.status(400).send({error: 'INCORRECT_EMAIL_OR_PASSWORD'});
    }
    await Model('User').updateOne({email}, { password: newPassword });
    res.status(204).end();
  } catch (e: any) {
    internalError(e, res);
  }
}));
router.post('/forgot-password', mongoCtx(async (req: any, res: any): Promise<any> => {
  const {email} = req.body;

  const user = await getAuthUserByEmail(email);
  if (!user) {
    return res.status(400).send({error: 'USER_WITH_EMAIL_NOT_FOUND'});
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
    return res.send({ data: true });
  } catch (e: any) {
    internalError(e, res);
  }
}));
router.post('/reset-password', mongoCtx(async (req: any, res: any): Promise<any> => {
  try {
    const {password, code, email} = req.body;
    const user = await getAuthUserByEmail(email);

    if (!user) {
      return res.status(400).send({error: 'USER_WITH_EMAIL_NOT_FOUND' });
    }

    if (user.resetPasswordToken !== code ) {
      return res.status(400).send({ error: 'Invalid reset code.' });
    }

    await updatePassword(user._id, password);

    const body = {_id: user._id, email: user.email, password};
    // @ts-ignore
    const authToken = jwt.sign({user: body}, process.env.SECRET);
    return res.cookie('token', authToken).send({data: {user, token: authToken}});
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

    return res.send({data: user});
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
    res.send({data: response});
  } catch (e: any) {
    internalError(e, res);
  }
}));

export default router;
