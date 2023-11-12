import {PostType} from "../../constants/types";
import {ObjectId} from 'bson';

export interface IPostAuthor {
   _id: ObjectId;
   fullName?: string;
   avatar?: string;
   username?: string;
}
export interface IPostContent {
   text?: string;
   textVi?: string;
   textEn?: string;
   audio?: string;
   photos?: string[];
   videos?: string[];
   tags?: string[];
   pinned?: boolean;
   of?: ObjectId;
}
export interface IPost extends IPostContent {
   categories?: ObjectId[];
   createdBy?: ObjectId;
   type?: PostType | string;
   byUser?: IPostAuthor,
   createdAt?: Date;
   react?: any;
   commentCount?: number;
}