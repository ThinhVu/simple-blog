import {internalError} from "../../utils/controllerUtils";
import * as CategoryBL from "./category.service";
import {Types} from "mongoose";
import {requireUser} from "../../middlewares/protected-route";
import polka from 'polka';

const router = polka();

router.get('/:id', async (req , res) => {
   try {
      const resp = await CategoryBL.getCategories(new Types.ObjectId(req.params.id))
      res.end(JSON.stringify(resp))
   } catch (e) {
      internalError(e, res)
   }
})
router.post('/', requireUser, async (req, res) => {
   try {
      const {name, tags} = req.body
      // @ts-ignore
      const resp = await CategoryBL.create(req.user._id, {name, tags})
      res.end(JSON.stringify(resp))
   } catch (e) {
      internalError(e, res)
   }
})
router.put('/:id', requireUser, async (req, res) => {
   try {
      // @ts-ignore
      const resp = await CategoryBL.update(req.user._id, new Types.ObjectId(req.params.id), req.body)
      res.end(JSON.stringify(resp))
   } catch (e) {
      internalError(e, res)
   }
})
router.delete('/:id', requireUser, async (req, res) => {
   try {
      // @ts-ignore
      const resp = await CategoryBL.remove(req.user._id, new Types.ObjectId(req.params.id) )
      res.end(JSON.stringify(resp))
   } catch (e) {
      internalError(e, res)
   }
})

export default router
