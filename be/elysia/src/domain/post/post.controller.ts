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
      const post = await PostBL.create({
         categories,
         type, text, textVi, textEn, audio, photos, videos, tags,
         createdBy: req.user._id, of: ofPost
      })
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
