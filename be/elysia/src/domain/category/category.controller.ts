<<<<<<< HEAD
import {internalError} from "../../utils/controllerUtils";
import * as CategoryBL from "./category.service";
import {AuthRequest} from "../../constants/types";
import {Types} from "mongoose";
import {requireUser} from "../../middlewares/protected-route";
import express from "express";

const router = express.Router()

router.get('/:id', async (req: AuthRequest , res) => {
   try {
      const resp = await CategoryBL.getCategories(new Types.ObjectId(req.params.id))
      res.json(resp)
   } catch (e) {
      internalError(e, res)
   }
})
router.post('/', requireUser, async (req: AuthRequest, res) => {
   try {
      const {name, tags} = req.body
      const resp = await CategoryBL.create(req.user._id, {name, tags})
      res.json(resp)
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/:id', requireUser, async (req: AuthRequest, res) => {
   try {
      const resp = await CategoryBL.update(req.user._id, new Types.ObjectId(req.params.id), req.body)
      res.json(resp)
   } catch (e) {
      internalError(e, res)
   }
})
router.delete('/:id', requireUser, async (req: AuthRequest, res) => {
   try {
      const resp = await CategoryBL.remove(req.user._id, new Types.ObjectId(req.params.id) )
      res.json(resp)
   } catch (e) {
      internalError(e, res)
   }
})

export default router
=======
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
>>>>>>> c49986eb039f5ee5e607434fad6695d8a2418eff
