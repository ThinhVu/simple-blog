import CategoryModel, {ICategory} from './category.model';
import {Types} from "mongoose";

export const create = async (uid: Types.ObjectId, data: Partial<ICategory>) => CategoryModel.create({...data, createdBy: uid, createdAt: new Date()});
export const update = async (uid: Types.ObjectId, _id: Types.ObjectId, change: Partial<ICategory>) => CategoryModel.updateOne({_id, createdBy: uid}, {$set: change});
export const remove = async (uid: Types.ObjectId, _id: Types.ObjectId) => CategoryModel.deleteOne({_id, createdBy: uid});
export const getCategories = async (uid: Types.ObjectId) => CategoryModel.find({createdBy: uid});
