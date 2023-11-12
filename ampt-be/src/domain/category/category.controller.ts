import {internalError} from "../../utils/controllerUtils";
import * as CategoryBL from "./category.service";
import {requireUser} from "../../middlewares/protected-route";
import express from "express";
import {ObjectId} from "bson";
import {mongoCtx} from "../../utils/mongoCtx";

const router = express.Router()

router.get('/:id', mongoCtx(async (req: any, res: any) => {
   try {
      const resp = await CategoryBL.getCategories(new ObjectId(req.params.id))
      res.json(resp)
   } catch (e: any) {
      internalError(e, res)
   }
}))
router.post('/', requireUser, mongoCtx(async (req: any, res: any) => {
   try {
      const {name, tags} = req.body
      // @ts-ignore
      const resp = await CategoryBL.create(req.user._id, {name, tags})
      res.json(resp)
   } catch (e: any) {
      internalError(e, res)
   }
}))
router.put('/:id', requireUser, mongoCtx(async (req: any, res: any) => {
   try {
      // @ts-ignore
      const resp = await CategoryBL.update(req.user._id, new ObjectId(req.params.id), req.body)
      res.json(resp)
   } catch (e: any) {
      internalError(e, res)
   }
}))
router.delete('/:id', requireUser, mongoCtx(async (req: any, res: any) => {
   try {
      // @ts-ignore
      const resp = await CategoryBL.remove(req.user._id, new ObjectId(req.params.id) )
      res.json(resp)
   } catch (e: any) {
      internalError(e, res)
   }
}))

export default router
