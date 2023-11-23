import _ from 'lodash';
import User, {IUser} from "./user.model";
import {
  createUser,
  getUserPublicInfoById, isUserWithEmailExisted,
  updateUser
} from './user.service';
import PostModel from '../post/post.model';
import {Types} from "mongoose";
import {AuthUser} from "../../constants/types";
import {Elysia, t} from "elysia";

export default function useUser(app) {
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
    return {user, token}
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

    return {user: body, token}
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
    return {user: body, token}
  });
  /** Users */
  app.get('/about/:id', async ({params: {id}, getAuthUser}) => {
    let user
    if (id === 'me') {
      const authUser = getAuthUser() as IUser
      user = await getUserPublicInfoById(authUser._id)
    } else if (id) {
      user = await getUserPublicInfoById(new Types.ObjectId(id))
    } else {
      throw new Error("Missing :id")
    }
    return user
  });
  app.put('/update-profile', async ({body: {avatar, fullName}, getAuthUser}) => {
    const authUser = getAuthUser() as IUser;
    const response = await updateUser(authUser._id, {avatar, fullName});
    const requireRevalidateComputedUser = !_.isEmpty(avatar) || !_.isEmpty(fullName)
    if (requireRevalidateComputedUser)
      PostModel.updateMany({createdBy: authUser._id}, {byUser: _.pick(response, ['_id', 'fullName', 'username', 'avatar'])})
        .then(console.log)
        .catch(console.error)
    return response
  })
  return app
}
