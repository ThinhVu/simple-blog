import {ObjectId} from 'bson'

export interface ICategory {
   _id?: ObjectId
   name: string;
   tags: string[];
   createdBy: ObjectId;
   createdAt: Date;
}
