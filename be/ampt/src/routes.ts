import {Router} from 'express';
import UserRoutes from "./domain/user/user.controller";
import CategoryRoutes from './domain/category/category.controller'
import PostRoutes from './domain/post/post.controller'
import {mongoCtx} from "./utils/mongoCtx";

const router = Router();
router.get('/inspect', mongoCtx((req: any, res: any) => res.json(req.$mongo)))
router.use('/user', UserRoutes);
router.use('/category', CategoryRoutes);
router.use('/post', PostRoutes);
export default router;
