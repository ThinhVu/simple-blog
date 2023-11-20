import * as CategoryBL from "./category.service";
import {Types} from "mongoose";
import {requireUser} from "../../middlewares/protected-route";
import {t} from 'elysia'

export default function useUser(app) {
   app.get('/:id', async ({params: {id}}) => {
      return CategoryBL.getCategories(new Types.ObjectId(id))
   }, {
      params: t.Object({
         id: t.String()
      })
   })

   app.post('/', requireUser, async ({body: {name, tags}}) => {
      return CategoryBL.create(req.user._id, {name, tags})
   }, {
      body: t.Object({
         name: t.String(),
         tags: t.Array(t.String())
      }),
      type: 'json'
   })

   app.put('/:id', requireUser, async ({params: {id}, body}) => {
      return CategoryBL.update(req.user._id, new Types.ObjectId(id), body)
   }, {
      params: t.Object({
         id: t.String()
      }),
      type: 'json'
   })

   app.delete('/:id', requireUser, async ({params: {id}}) => {
      return CategoryBL.remove(req.user._id, new Types.ObjectId(id) )
   }, {
      params: t.Object({
         id: t.String()
      })
   })
}