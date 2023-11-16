import {UserRole} from '../../constants/types';
import {ObjectId} from "bson";

export interface IPublicUserInfo {
   avatar?: string;
   role?: UserRole;
   fullName?: string;
   username?: string;
   email?: string;
}

export interface IUser extends IPublicUserInfo{
   _id: ObjectId;
   emailVerified?: boolean;
   password: string;
   resetPasswordToken?: string;
   createdAt: Date;
}