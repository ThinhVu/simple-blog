import {model, Schema, Types} from 'mongoose';

const CategorySchema = new Schema({
   name: String,
   tags: [String],
   createdBy: Schema.Types.ObjectId,
   createdAt: Date
})

export interface ICategory {
   name: string;
   tags: string[];
   createdBy: Types.ObjectId;
   createdAt: Date;
}

export default model<ICategory>('Category', CategorySchema)
