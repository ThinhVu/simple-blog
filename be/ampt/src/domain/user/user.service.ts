import {Model} from "../../utils/mongoCtx";
import {IPublicUserInfo, IUser} from './user.model';
import {ObjectId} from "bson";
import _ from 'lodash'

// Note: This method is only invoked by auth, not for public use
export const getAuthUser = async (_id: ObjectId): Promise<IUser> => Model('User').findOneAndUpdate({_id}).select('-password');
export const getAuthUserByEmail = async (email: string): Promise<IUser> => Model('User').findOne({email}).select('-password')


const userPublicInfoFields = {_id: 1, avatar: 1, role: 1, fullName: 1, username: 1, email: 1};
export const getUserPublicInfo = (userInfo: IUser): IPublicUserInfo => _.pick(userInfo, Object.keys(userPublicInfoFields));
export const getUserPublicInfoById = async (_id: ObjectId): Promise<IPublicUserInfo> => Model('User').findOne({_id}, userPublicInfoFields);
export const getUserPublicInfoByIds = async (ids: ObjectId[]): Promise<IPublicUserInfo[]> => Model('User').find({_id: {$in: ids}}, userPublicInfoFields)
export const isUserWithEmailExisted = async (email: string): Promise<boolean> => await Model('User').count({email}) > 0

export const findOne = (qry: any, projection?: any) => Model('User').findOne(qry, projection)

export const updateOne = (qry: any, change: any) => Model('User').updateOne(qry, change)

export const createUser = async (data: Partial<IUser>) : Promise<IUser> => {
   return await Model('User').create(data);
};
// update
export const updatePassword = async (_id: ObjectId, password: string): Promise<void> => {
   return Model('User').updateOne({_id}, {password, resetPasswordToken: ''});
};
export const updateUserResetPasswordToken = async (_id: ObjectId, resetPasswordToken: string): Promise<void> => {
   return Model('User').updateOne({_id}, {resetPasswordToken})
}
export const updateUser = async (_id: ObjectId, fieldsToUpdate: Partial<IUser>): Promise<IUser> => {
   return Model('User').findOneAndUpdate({_id}, {...fieldsToUpdate}, {new: true});
};
