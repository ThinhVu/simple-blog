import {Schema, Types, model} from 'mongoose';
import {PostType} from "../../constants/types";

const PostSchema = new Schema({
   categories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category'
   }],
   createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   of: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
   },
   type: {type: PostType},
   text: String,
   textVi: String,
   textEn: String,
   audio: String,
   photos: [String],
   videos: [String],
   tags: [String],
   pinned: Boolean,
   byUser: Object,
   react: Object,
   commentCount: Number,
   createdAt: Date,
})
export interface IPostAuthor {
   _id: Types.ObjectId;
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
   of?: Types.ObjectId;
}
export interface IPost extends IPostContent {
   categories?: Types.ObjectId[];
   createdBy?: Types.ObjectId;
   type?: PostType | string;
   byUser?: IPostAuthor,
   createdAt?: Date;
   react?: any;
   commentCount?: number;
}
export default model<IPost>('Post', PostSchema)
