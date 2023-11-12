import {internalError} from '../../utils/controllerUtils';
import {getPosts, getPost, create, update, react, remove, unReact, getComments} from './post.service';
import {PostReactType} from "../../constants/types";
import {requireUser} from "../../middlewares/protected-route";
import express from "express";
import {mongoCtx} from "../../utils/mongoCtx";
import {ObjectId} from "bson";

const router = express.Router();

/** Post */
router.get('/', mongoCtx(async (req: any, res: any) => {
   try {
      const {uid, cid, p} = req.query as {uid: string, cid: string, p: string};
      if (!uid) throw 'uid is invalid'
      if (!cid) throw 'cid is invalid'
      const posts = await getPosts(new ObjectId(uid), cid === '0' ? undefined : new ObjectId(cid), +p || 1);
      res.send({data: posts})
   } catch (e: any) {
      internalError(e, res)
   }
}))
router.get('/:id', mongoCtx(async (req: any, res: any) => {
   try {
      const postId = req.params.id
      if (!postId) throw 'id is missing'
      const post = await getPost(postId);
      res.send({data: post});
   } catch (e: any) {
      internalError(e, res);
   }
}))
router.post('/', requireUser, mongoCtx(async (req: any, res: any) => {
   try {
      const {categories, type, text, textVi, textEn, audio, photos, videos, tags, of} = req.body;
      const ofPost = of;
      // @ts-ignore
      const uid = req.user._id
      const post = await create({
         categories,
         type, text, textVi, textEn, audio, photos, videos, tags,
         createdBy: uid, of: ofPost
      })
      res.send({data: post})
   } catch (e: any) {
      internalError(e, res)
   }
}))
router.delete('/:id', requireUser, mongoCtx(async (req: any, res: any) => {
   try {
      const postId = req.params.id
      if (!postId)
         throw 'Post id is invalid'
      // @ts-ignore
      const uid = req.user._id
      await remove(postId, uid);
      res.send({data: true})
   } catch (e: any) {
      internalError(e, res)
   }
}))
router.put('/:id', requireUser, mongoCtx(async (req: any, res: any) => {
   try {
      const postId = req.params.id
      if (!postId)
         throw 'Post id is invalid'
      // @ts-ignore
      const uid = req.user._id
      const post = await update(postId, uid, req.body);
      res.send({data: post});
   } catch (e: any) {
      internalError(e, res);
   }
}))
router.put('/react/:id', requireUser, mongoCtx(async (req: any, res: any) => {
   try {
      const postId = req.params.id
      if (!postId)
         throw 'Post id is invalid'
      const {reactType} = req.query
      // @ts-ignore
      const uid = req.user._id
      const rs = await react(reactType as PostReactType, postId, uid);
      res.send({data: rs})
   } catch (e: any) {
      internalError(e, res)
   }
}))
router.put('/un-react/:id', requireUser, mongoCtx(async (req: any, res: any) => {
   try {
      const postId = req.params.id
      if (!postId)
         throw 'Post id is invalid'
      // @ts-ignore
      const uid = req.user._id
      await unReact(postId, uid);
      res.send({data: true})
   } catch (e: any) {
      internalError(e, res)
   }
}))
router.get('/comments/:id', mongoCtx(async (req: any, res: any) => {
   try {
      const postId = req.params.id;
      if (!postId)
         throw 'Post id is invalid'
      const page = Number(req.query?.page) || 1;
      const post = await getComments(postId, page);
      res.send({data: post});
   } catch (e: any) {
      internalError(e, res);
   }
}))

export default router;
