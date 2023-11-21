<<<<<<< HEAD
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
=======
import {Elysia} from "elysia";
import UserRoutes from "./domain/user/user.controller";
import CategoryRoutes from './domain/category/category.controller'
import PostRoutes from './domain/post/post.controller'


export default function useRoutes(app) {
  app.get('/', async () => `Hello elysia`)
  app.group('/user', UserRoutes);
  app.group('/category', CategoryRoutes);
  app.group('/post', PostRoutes);
}
>>>>>>> c49986eb039f5ee5e607434fad6695d8a2418eff
