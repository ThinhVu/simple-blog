import {Request} from "express";
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
}

export interface AuthRequest extends Request {
  user: AuthUser
}
