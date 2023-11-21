import UserModel from '../user/user.model';
import PostModel, {IPost, IPostAuthor} from './post.model';
import PostReactModel from './postReact.model';
import {PostReactType, PostType} from "../../constants/types";
import _ from 'lodash';
import {Types} from "mongoose";

export const create = async ({
                                categories, type, text, textVi, textEn, audio,
                                photos, videos, tags, createdBy, of
                             }: IPost): Promise<IPost> => {
   const user = await UserModel.findOne({_id: createdBy})
   if (!user)
      throw new Error("User not found");
   if (of)
      of = new Types.ObjectId(of);
   if (of) {
      const parentPost = await PostModel.findById(of)
      if (!parentPost)
         throw new Error("Post not found or has been deleted");
      let rootPostId;
      if (parentPost.type === PostType.Comment) {
         rootPostId = parentPost.of;
      } else {
         rootPostId = parentPost._id;
      }
      await PostModel.updateOne({_id: rootPostId}, {$inc: {commentCount: 1}})
   }
   const byUser: IPostAuthor = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      avatar: user.avatar
   }
   return await PostModel.create({
      categories,
      type,
      text, textVi, textEn,
      audio, photos, videos,
      tags,
      createdBy,
      byUser,
      createdAt: new Date(),
      react: {},
      commentCount: 0,
      of
   })
}

const omitFields = {__v: 0, of: 0, createdBy: 0}
export const getPosts = async (uid: Types.ObjectId, cid: Types.ObjectId, page = 1): Promise<IPost[]> => {
   const NEWS_PER_PAGE = 10
   const matchQry = (
      cid == null
         ? {type: PostType.TimeLine, createdBy: uid}
         : {categories: {$elemMatch: {$eq: cid}}, type: PostType.TimeLine, createdBy: uid}
   )
   return (
      await PostModel.find(matchQry, omitFields)
      .skip(Math.max(+page - 1, 0) * NEWS_PER_PAGE)
      .limit(NEWS_PER_PAGE)
      .sort({pinned: -1, createdAt: -1})
   )
}
export const getPost = async (_id: Types.ObjectId): Promise<IPost> => {
   return PostModel.findOne({_id}, omitFields)
}
export const update = async (_id: Types.ObjectId, createdBy: Types.ObjectId, change: Partial<IPost>): Promise<IPost> => {
   return PostModel.findOneAndUpdate({_id, createdBy}, {$set: change})
}
export const remove = async (_id: Types.ObjectId, createdBy: Types.ObjectId): Promise<void> => {
   const post = await PostModel.findOne({_id, createdBy})
   if (!post)
      throw new Error("The post may not exist or you don't have permission to delete it");
   if (post.type === PostType.Comment) {
      const parentPost = await PostModel.findOne({_id: post.of});
      const is2ndLayerComment = parentPost.type === PostType.Comment;
      if (is2ndLayerComment) {
         await PostModel.deleteOne({_id: post._id});
         await PostModel.updateOne({_id: parentPost.of}, {$inc: {commentCount: -1}});
      } else {
         const childCommentDeleteResult = await PostModel.deleteMany({of: _id});
         await PostModel.deleteOne({_id});
         await PostModel.updateOne({_id: post.of}, {$inc: {commentCount: -(childCommentDeleteResult.deletedCount + 1)}});
      }
   } else {
      const firstLayerComments = (await PostModel.find({of: _id}, {_id: 1})).map(cmt => cmt._id);
      await PostModel.deleteMany({of: {$in: firstLayerComments}});
      await PostModel.deleteMany({_id: {$in: firstLayerComments}});
      await PostModel.deleteOne({_id});
   }
}
export const react = async (react: PostReactType, postId: Types.ObjectId, userId: Types.ObjectId): Promise<any> => {
   const reactDoc = await PostReactModel.findOne({of: userId, to: postId})
   if (reactDoc) {
      if (reactDoc.type === react)
         return {}
      if (PostReactType.UnReact === react) {
         PostReactModel.deleteOne({_id: reactDoc._id}).catch(console.error)
         PostModel.updateOne({_id: postId}, {$inc: {[`react.${reactDoc.type}`]: -1}}).catch(console.error)
         return {[reactDoc.type]: -1}
      } else {
         PostReactModel.updateOne({_id: reactDoc._id}, {type: react}).catch(console.error)
         PostModel.updateOne({_id: postId}, {$inc: {[`react.${react}`]: 1, [`react.${reactDoc.type}`]: -1}}).catch(console.error)
         return {[react]: 1, [reactDoc.type]: -1}
      }
   } else {
      if (PostReactType.UnReact === react)
         return {}
      PostReactModel.create({type: react, of: userId, to: postId}).catch(console.error)
      PostModel.updateOne({_id: postId}, {$inc: {[`react.${react}`]: 1}}).catch(console.error)
      return {[react]: 1}
   }
}
export const unReact = async (postId: Types.ObjectId, uid: Types.ObjectId): Promise<any> => react(PostReactType.UnReact, postId, uid)
export const getComments = async (postId: Types.ObjectId, page: number) => {
   const post = await PostModel.findOne({_id: postId}, { type: 1})
   if (!post)
      return []
   const COMMENTS_PER_PAGE = 10;
   const aggStep: any[] = [
         {$match: {of: postId}},
         {$sort: {createdAt: -1}},
         {$skip: Math.max(+page - 1, 0) * COMMENTS_PER_PAGE},
         {$limit: COMMENTS_PER_PAGE},
   ]

   if (post.type === PostType.Comment) {
      aggStep.push({$project: omitFields})
   } else {
      aggStep.push({
            $lookup: {
               from: 'posts',
               let: {postId: "$_id"},
               pipeline: _.compact([
                  {$match: {$expr: {$eq: ["$of", "$$postId"]}}},
                  {$sort: {createdAt: 1}},
                  // {$limit: COMMENTS_PER_PAGE},
                  {$project: omitFields},
               ]), as: "comments"
            }
         },
         {$project: omitFields}
      )
   }

   return PostModel.aggregate(aggStep)
}
