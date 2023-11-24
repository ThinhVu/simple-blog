import * as PostBL from './post.service';
import {PostReactType} from "../../constants/types";
import {IUser} from "../user/user.model";
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
   app.post('/', async ({getAuthUser, body}) => {
      const user = await getAuthUser() as IUser
      const {categories, type, text, textVi, textEn, audio, photos, videos, tags, of} = body;
      const ofPost = To.objectId(of, undefined);
      const post = await PostBL.create({
         categories,
         type, text, textVi, textEn, audio, photos, videos, tags,
         createdBy: user._id, of: ofPost
      })
      return post
   })
   app.delete('/:id', async ({getAuthUser, params: {id}}) => {
      const user = await getAuthUser() as IUser
      return PostBL.remove(To.objectId(id, 'Post id is invalid'), user._id)
   })
   app.put('/:id', async ({getAuthUser, params: {id}, body}) => {
      const user = await getAuthUser() as IUser
      return PostBL.update(To.objectId(id, 'Post id is invalid'), user._id, body)
   })
   app.put('/react/:id', async ({getAuthUser, params: {id}, query: {reactType}}) => {
      const user = await getAuthUser() as IUser
      return PostBL.react(reactType as PostReactType, To.objectId(id, 'Post id is invalid'), user._id)
   })
   app.put('/un-react/:id', async ({getAuthUser, params: {id}}) => {
      const user = await getAuthUser() as IUser
      return PostBL.unReact(To.objectId(id, 'Post id is invalid'), user._id)
   })
   app.get('/comments/:id', async ({params: {id}, query: {page}}) => {
      return PostBL.getComments(To.objectId(id, 'Post id is invalid'), +page || 1)
   })
   return app
}
