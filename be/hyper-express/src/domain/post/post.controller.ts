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
      const {uid, cid, p} = req.query_parameters;
      const posts = await PostBL.getPosts(To.objectId(uid, 'uid is invalid'), cid === '0' ? null : To.objectId(cid, 'cid is invalid'), +p || 1);
      res.json(posts)
   } catch (e) {
      internalError(e, res)
   }
})
router.get('/:id', async (req: Request, res: Response) => {
   try {
      const postId = req.path_parameters.id
      const post = await PostBL.getPost(To.objectId(postId));
      res.json(post);
   } catch (e) {
      internalError(e, res);
   }
})
router.post('/', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const {categories, type, text, textVi, textEn, audio, photos, videos, tags, of} = await req.json();
      const ofPost = To.objectId(of, null);
      const post = await PostBL.create({
         categories,
         type, text, textVi, textEn, audio, photos, videos, tags,
         createdBy: req.user._id, of: ofPost
      })
      res.json(post)
   } catch (e) {
      internalError(e, res)
   }
})
router.delete('/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const postId = req.path_parameters.id
      await PostBL.remove(To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.json(true)
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const postId = req.path_parameters.id
      const post = await PostBL.update(To.objectId(postId, 'Post id is invalid'), req.user._id, await req.json());
      res.json(post);
   } catch (e) {
      internalError(e, res);
   }
})
router.put('/react/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const postId = req.path_parameters.id
      const {reactType} = req.query
      const rs = await PostBL.react(reactType as PostReactType, To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.json(rs)
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/un-react/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const postId = req.path_parameters.id
      await PostBL.unReact(To.objectId(postId, 'Post id is invalid'), req.user._id);
      res.json(true)
   } catch (e) {
      internalError(e, res)
   }
})
router.get('/comments/:id', async (req: Request, res: Response) => {
   try {
      const postId = req.path_parameters.id;
      const page = +req.query.page || 1;
      const post = await PostBL.getComments(To.objectId(postId, 'Post id is invalid'), page);
      res.json(post);
   } catch (e) {
      internalError(e, res);
   }
})

export default router;
