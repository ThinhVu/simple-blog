import mongoose, {Schema, Types} from 'mongoose';
import {PostReactType} from "../../constants/types";

const PostReactSchema = new Schema({
   type: {type: PostReactType},
   of: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   to: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
   }
})

export interface IPostReact {
   _id: Types.ObjectId;
   type: PostReactType;
   of: Types.ObjectId;
   to: Types.ObjectId;
}

export default mongoose.model<IPostReact>('PostReact', PostReactSchema)
