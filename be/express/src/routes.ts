import {Router} from 'express';
import UserRoutes from "./domain/user/user.controller";
import CategoryRoutes from './domain/category/category.controller'
import PostRoutes from './domain/post/post.controller'

const router = Router();

router.get('/', async (req, res) => res.send(`Hello express`));
router.use('/user', UserRoutes);
router.use('/category', CategoryRoutes);
router.use('/post', PostRoutes);

export default router;