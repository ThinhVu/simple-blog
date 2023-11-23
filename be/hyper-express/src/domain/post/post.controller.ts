import {internalError} from '../../utils/controllerUtils';
import * as PostBL from './post.service';
import {AuthRequest, PostReactType} from "../../constants/types";
import {requireUser} from "../../middlewares/protected-route";
import To from "../../utils/data-parser";
import {Router} from 'hyper-express';
import {Request, Response} from "hyper-express";

const router = new Router();

/** Post */
router.get('/', async (req: Request, res: Response) => {
   try {
      const {uid, cid, p} = req.query;
      const posts = await PostBL.getPosts(To.objectId(uid, 'uid is invalid'), cid === '0' ? null : To.objectId(cid, 'cid is invalid'), +p || 1);
      res.send(JSON.stringify({data: posts}))
   } catch (e) {
      internalError(e, res)
   }
})
router.get('/:id', async (req: Request, res: Response) => {
   try {
      const postId = req.params.id
      const post = await PostBL.getPost(To.objectId(postId));
      res.send(JSON.stringify({data: post}));
   } catch (e) {
      internalError(e, res);
   }
})
router.post('/', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const {categories, type, text, textVi, textEn, audio, photos, videos, tags, of} = req.body;
      const ofPost = To.objectId(of, null);
      const post = await PostBL.create({
         categories,
         type, text, textVi, textEn, audio, photos, videos, tags,
         createdBy: req.user._id, of: ofPost
      })
      res.send(JSON.stringify({data: post}))
   } catch (e) {
      internalError(e, res)
   }
})
router.delete('/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const postId = req.params.id
      await PostBL.remove(To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.send(JSON.stringify({data: true}))
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const postId = req.params.id
      const post = await PostBL.update(To.objectId(postId, 'Post id is invalid'), req.user._id, req.body);
      res.send(JSON.stringify({data: post}));
   } catch (e) {
      internalError(e, res);
   }
})
router.put('/react/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const postId = req.params.id
      const {reactType} = req.query
      const rs = await PostBL.react(reactType as PostReactType, To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.send(JSON.stringify({data: rs}))
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/un-react/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const postId = req.params.id
      await PostBL.unReact(To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.send(JSON.stringify({data: true}))
   } catch (e) {
      internalError(e, res)
   }
})
router.get('/comments/:id', async (req: Request, res: Response) => {
   try {
      const postId = req.params.id;
      const page = +req.query.page || 1;
      const post = await PostBL.getComments(To.objectId(postId, 'Post id is invalid'), page);
      res.send(JSON.stringify({data: post}));
   } catch (e) {
      internalError(e, res);
   }
})

export default router;
