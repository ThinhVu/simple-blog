import {internalError} from "../../utils/controllerUtils";
import * as CategoryBL from "./category.service";
import {AuthRequest} from "../../constants/types";
import {Types} from "mongoose";
import {requireUser} from "../../middlewares/protected-route";
import {Router} from 'hyper-express';
import {Response} from "hyper-express";

const router = new Router()

router.post('/', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const {name, tags} = await req.json()
      const resp = await CategoryBL.create(req.user._id, {name, tags})
      res.json(resp)
   } catch (e) {
      internalError(e, res)
   }
})
router.get('/:id', async (req: AuthRequest, res: Response) => {
   try {
      const resp = await CategoryBL.getCategories(new Types.ObjectId(req.path_parameters.id))
      res.json(resp)
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const resp = await CategoryBL.update(req.user._id, new Types.ObjectId(req.path_parameters.id), await req.json())
      res.json(resp)
   } catch (e) {
      internalError(e, res)
   }
})
router.delete('/:id', {middlewares: [requireUser]}, async (req: AuthRequest, res: Response) => {
   try {
      const resp = await CategoryBL.remove(req.user._id, new Types.ObjectId(req.path_parameters.id) )
      res.json(resp)
   } catch (e) {
      internalError(e, res)
   }
})

export default router
