import {Model} from "../../utils/mongoCtx";
import {ICategory} from './category.model';
import {ObjectId} from "bson";

export const create = async (uid: ObjectId, data: Partial<ICategory>) => Model('Category').create({...data, createdBy: uid, createdAt: new Date()});
export const update = async (uid: ObjectId, _id: ObjectId, change: Partial<ICategory>) => Model('Category').updateOne({_id, createdBy: uid}, {$set: change});
export const remove = async (uid: ObjectId, _id: ObjectId) => Model('Category').deleteOne({_id, createdBy: uid});
export const getCategories = async (uid: ObjectId) => Model('Category').find({createdBy: uid});
