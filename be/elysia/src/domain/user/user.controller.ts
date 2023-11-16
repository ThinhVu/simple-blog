import _ from 'lodash';
import User, {IUser} from "./user.model";
import {
  createUser, getAuthUserByEmail,
  getUserPublicInfoById, isUserWithEmailExisted, updatePassword,
  updateUser, updateUserResetPasswordToken
} from './user.service';
import PostModel from '../post/post.model';
import {Types} from "mongoose";
import {requireUser} from "../../middlewares/protected-route";
import {AuthUser} from "../../constants/types";
import {EmailRegex} from "../../constants/regex";
import {generateRandomCode} from "../../utils/commonUtils";
import {sendEmail} from "../../utils/email";
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer'
import {Elysia, t} from "elysia";

export default function useUser(app) {
  app.use(jwt({
    name: 'jwt',
    exp: '7d',
    secret: process.env.SECRET
  }))

  app.use(bearer())

  /**
   * Authentication
   */
  app.get('/can-use-email', async ({body: {email}}) => {
    if (!email) throw new Error('MISSING_FIELD: email')
    if (!email.match(EmailRegex)) throw new Error('INVALID_EMAIL_FORMAT')
    if (await isUserWithEmailExisted(email)) throw new Error('EMAIL_HAS_BEEN_USED')
    return {data: {result: true}}
  });

  app.post('/sign-up', async ({jwt, body: {email, password}, cookie}) => {
    if (!email || !password) throw new Error('MISSING_FIELD: email or password')
    if (await isUserWithEmailExisted(email)) throw new Error('EMAIL_HAS_BEEN_USED')
    const username = new Date().getTime().toString();
    const hashPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10, // number between 4-31
    })
    const user = await createUser({username, email, password: hashPassword, createdAt: new Date()});
    const authUser : AuthUser = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: authUser});
    cookie.value.token = token;
    return {data: {user, token}}
  })

  app.post('/sign-in', async ({jwt, body: {email, password}, cookie}) => {
    const user = await User.findOne({email});

    if (!user) {
      throw new Error('USER_WITH_EMAIL_NOT_FOUND')
    }

    const validate = await Bun.password.verify(password, user.password, 'bcrypt');
    if (!validate) throw new Error('INCORRECT_EMAIL_OR_PASSWORD')

    const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: body})

    cookie.value.token = token

    return {data: {user: body, token}}
  });
  app.post('/sign-out', async ({cookie}) => {
    if (cookie.value.token) {
      cookie.value.token = ''
    }
    return {data: {result: true}}
  })

  app.get('/auth', async ({jwt, request, cookie}) => {
    const jwtToken = request.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(jwtToken);
    const expired = Date.now() > decoded.exp * 1000;
    let user = decoded.user;
    if (expired) throw new Error('EXPIRED')
    if (!user) throw new Error('INVALID_USER')
    const body = {_id: user._id, email: user.email, password: user.password, role: user.role}
    const token = jwt.sign({user: body})
    cookie.value.token = token
    return {data: {user: body, token}}
  });
  app.post('/change-password', async ({body: {email, password, newPassword}}) => {
    const newPasswordHash = await Bun.password.hash(newPassword, {
      algorithm: "bcrypt",
      cost: 10, // number between 4-31
    })
    const user = await User.findOne({email});
    if (!user) throw new Error('INCORRECT_EMAIL_OR_PASSWORD')

    const isValidPassword = await Bun.password.verify(password, user.password, 'bcrypt')
    if (!isValidPassword) throw new Error('INCORRECT_EMAIL_OR_PASSWORD')

    await User.updateOne({email}, { password: newPasswordHash });

    return new Response(undefined, { status: 204})
  })

  app.post('/forgot-password', async ({body: {email}}) => {
    const user = await getAuthUserByEmail(email);
    if (!user) throw new Error('USER_WITH_EMAIL_NOT_FOUND')

    const resetPasswordCode = generateRandomCode(6);
    await updateUserResetPasswordToken(user._id, resetPasswordCode);

    const greeting = `Hey "${user.fullName || user.email}"`;
    const description = `We received a request to reset your password. The reset password code is "${resetPasswordCode}".\r\nIf you do not make this request, you can safely ignore this message.`;

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
    return { data: true }
  })

  app.post('/reset-password', async ({body: {password, code, email}, cookie}): Promise<any> => {
    const user = await getAuthUserByEmail(email);

    if (!user) throw new Error('USER_WITH_EMAIL_NOT_FOUND')
    if (user.resetPasswordToken !== code ) throw new Error('Invalid reset code.')

    const passwordHash = await Bun.password.hash(password, {
      algorithm: 'bcrypt',
      cost: 10
    })
    await updatePassword(user._id, passwordHash);

    const body = {_id: user._id, email: user.email, password: passwordHash};
    const authToken = jwt.sign({user: body});
    cookie.value.token = authToken
    return {data: {user, token: authToken}}
  });

  /** Users */
  app.get('/about/:id', requireUser, async ({params: {id}}) => {
    let user
    if (id === 'me') {
      const authUser = req.user as IUser
      user = await getUserPublicInfoById(authUser._id)
    } else if (id) {
      user = await getUserPublicInfoById(new Types.ObjectId(id))
    } else {
      throw new Error("Missing :id")
    }
    return {data: user}
  });
  app.put('/update-profile', requireUser, async ({body: {avatar, fullName}}) => {
    const authUser = req.user as IUser;
    const response = await updateUser(authUser._id, {avatar, fullName});
    const requireRevalidateComputedUser = !_.isEmpty(avatar) || !_.isEmpty(fullName)
    if (requireRevalidateComputedUser)
      PostModel.updateMany({createdBy: authUser._id}, {byUser: _.pick(response, ['_id', 'fullName', 'username', 'avatar'])})
        .then(console.log)
        .catch(console.error)
    return {data: response}
  })
}
