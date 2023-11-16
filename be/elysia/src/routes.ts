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