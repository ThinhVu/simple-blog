import {PostReactType} from "../../constants/types";
import {ObjectId} from "bson";

export interface IPostReact {
   _id: ObjectId;
   type: PostReactType;
   of: ObjectId;
   to: ObjectId;
}