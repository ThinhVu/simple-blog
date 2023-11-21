//import {Router} from 'express';
import {Router} from 'hyper-express';
import UserRoutes from "./domain/user/user.controller";
import CategoryRoutes from './domain/category/category.controller'
import PostRoutes from './domain/post/post.controller'
import {AuthRequest} from "./constants/types";
// @ts-ignore
import packageJson from '../package.json';
import {Request} from 'hyper-express';
const router = new Router();
router.get('/', async (req: AuthRequest, res) => {
    const contentType = req.header('content-type');
    if (contentType=='application/json') {
        await req.json({limit: '50mb'})
    } else {
        await req.urlencoded()
    }
    res.send(`Api version: ${packageJson.version}`)
});
router.use('/user', UserRoutes);
router.use('/category', CategoryRoutes);
router.use('/post', PostRoutes);

export default router;
