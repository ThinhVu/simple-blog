import {Router} from 'express';
import UserRoutes from "./domain/user/user.controller";
import CategoryRoutes from './domain/category/category.controller'
import PostRoutes from './domain/post/post.controller'
// @ts-ignore
import packageJson from '../package.json';

const router = Router();
router.get('/', async (req, res) => res.send(`Api version: ${packageJson.version}`));
router.use('/user', UserRoutes);
router.use('/category', CategoryRoutes);
router.use('/post', PostRoutes);

export default router;
