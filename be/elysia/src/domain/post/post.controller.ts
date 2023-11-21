<<<<<<< HEAD
import {internalError} from '../../utils/controllerUtils';
import * as PostBL from './post.service';
import {AuthRequest, PostReactType} from "../../constants/types";
import {requireUser} from "../../middlewares/protected-route";
import express from "express";
import To from "../../utils/data-parser";

const router = express.Router();

/** Post */
router.get('/', async (req, res) => {
   try {
      const {uid, cid, p} = req.query;
      const posts = await PostBL.getPosts(To.objectId(uid, 'uid is invalid'), cid === '0' ? null : To.objectId(cid, 'cid is invalid'), +p || 1);
      res.send({data: posts})
   } catch (e) {
      internalError(e, res)
   }
})
router.get('/:id', async (req, res) => {
   try {
      const postId = req.params.id
      const post = await PostBL.getPost(To.objectId(postId));
      res.send({data: post});
   } catch (e) {
      internalError(e, res);
   }
})
router.post('/', requireUser, async (req: AuthRequest, res) => {
   try {
      const {categories, type, text, textVi, textEn, audio, photos, videos, tags, of} = req.body;
      const ofPost = To.objectId(of, null);
=======
import * as PostBL from './post.service';
import {PostReactType} from "../../constants/types";
import {requireUser} from "../../middlewares/protected-route";
import To from "../../utils/data-parser";


export default function usePost(app) {
   /** Post */
   app.get('/', async ({query: {uid, cid, p}}) => {
      return PostBL.getPosts(
        To.objectId(uid, 'uid is invalid'),
        cid === '0' ? undefined : To.objectId(cid, 'cid is invalid'),
        +p || 1
      );
   })
   app.get('/:id', async ({params: {id}}) => {
      return PostBL.getPost(To.objectId(id));
   })
   app.post('/', requireUser, async ({body}) => {
      const {categories, type, text, textVi, textEn, audio, photos, videos, tags, of} = body;
      const ofPost = To.objectId(of, undefined);
>>>>>>> c49986eb039f5ee5e607434fad6695d8a2418eff
      const post = await PostBL.create({
         categories,
         type, text, textVi, textEn, audio, photos, videos, tags,
         createdBy: req.user._id, of: ofPost
      })
<<<<<<< HEAD
      res.send({data: post})
   } catch (e) {
      internalError(e, res)
   }
})
router.delete('/:id', requireUser, async (req: AuthRequest, res) => {
   try {
      const postId = req.params.id
      await PostBL.remove(To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.send({data: true})
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/:id', requireUser, async (req: AuthRequest, res) => {
   try {
      const postId = req.params.id
      const post = await PostBL.update(To.objectId(postId, 'Post id is invalid'), req.user._id, req.body);
      res.send({data: post});
   } catch (e) {
      internalError(e, res);
   }
})
router.put('/react/:id', requireUser, async (req: AuthRequest, res) => {
   try {
      const postId = req.params.id
      const {reactType} = req.query
      const rs = await PostBL.react(reactType as PostReactType, To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.send({data: rs})
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/un-react/:id', requireUser, async (req: AuthRequest, res) => {
   try {
      const postId = req.params.id
      await PostBL.unReact(To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.send({data: true})
   } catch (e) {
      internalError(e, res)
   }
})
router.get('/comments/:id', async (req, res) => {
   try {
      const postId = req.params.id;
      const page = +req.query.page || 1;
      const post = await PostBL.getComments(To.objectId(postId, 'Post id is invalid'), page);
      res.send({data: post});
   } catch (e) {
      internalError(e, res);
   }
})

export default router;
=======
      return post
   })
   app.delete('/:id', requireUser, async ({params: {id}}) => {
      return PostBL.remove(To.objectId(id, 'Post id is invalid'), req.user._id)
   })
   app.put('/:id', requireUser, async ({params: {id}, body}) => {
      return PostBL.update(To.objectId(id, 'Post id is invalid'), req.user._id, body)
   })
   app.put('/react/:id', requireUser, async ({params: {id}, query: {reactType}}) => {
      return PostBL.react(reactType as PostReactType, To.objectId(id, 'Post id is invalid'), req.user._id)
   })
   app.put('/un-react/:id', requireUser, async ({params: {id}}) => {
      return PostBL.unReact(To.objectId(id, 'Post id is invalid'), req.user._id)
   })
   app.get('/comments/:id', async ({params: {id}, query: {page}}) => {
      return PostBL.getComments(To.objectId(id, 'Post id is invalid'), +page || 1)
   })
}
>>>>>>> c49986eb039f5ee5e607434fad6695d8a2418eff
