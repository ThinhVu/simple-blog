import * as CategoryBL from "./category.service";
import {Types} from "mongoose";
import {t} from 'elysia'
import {IUser} from "../user/user.model";

export default function useUser(app) {
   app.get('/:id', async ({params: {id}}) => {
      return CategoryBL.getCategories(new Types.ObjectId(id))
   }, {
      params: t.Object({
         id: t.String()
      })
   })

   app.post('/', async ({getAuthUser, body: {name, tags}}) => {
      const user = await getAuthUser() as IUser;
      return CategoryBL.create(user._id, {name, tags})
   }, {
      body: t.Object({
         name: t.String(),
         tags: t.Array(t.String())
      }),
      type: 'json'
   })

   app.put('/:id', async ({getAuthUser, params: {id}, body}) => {
      const user = await getAuthUser() as IUser;
      return CategoryBL.update(user._id, new Types.ObjectId(id), body)
   }, {
      params: t.Object({
         id: t.String()
      })
   })

   app.delete('/:id', async ({getAuthUser, params: {id}}) => {
      const user = await getAuthUser() as IUser
      return CategoryBL.remove(user._id, new Types.ObjectId(id) )
   }, {
      params: t.Object({
         id: t.String()
      })
   })
   return app
}