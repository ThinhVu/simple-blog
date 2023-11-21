<<<<<<< HEAD
import {Request} from "express";
=======
>>>>>>> c49986eb039f5ee5e607434fad6695d8a2418eff
import {Types} from "mongoose";

export enum UserRole {
  Regular = 'Regular',
  Admin = 'Admin'
}

export enum PostType {
  Comment = 'C',
  Story = 'S',
  TimeLine = 'TL'
}

export enum PostReactType {
  Like = 'like',
  Dislike = 'dislike',
  Love = 'love',
  Care = 'care',
  Haha = 'haha',
  Wow = 'wow',
  Sad = 'sad',
  Angry = 'angry',
  UnReact = ''
}

export interface AuthUser {
  _id: Types.ObjectId,
  email: string,
  password: string,
  role: UserRole
<<<<<<< HEAD
}

export interface AuthRequest extends Request {
  user: AuthUser
}
=======
}
>>>>>>> c49986eb039f5ee5e607434fad6695d8a2418eff
