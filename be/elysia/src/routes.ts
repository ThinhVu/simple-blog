import UserRoutes from "./domain/user/user.controller";
import CategoryRoutes from './domain/category/category.controller'
import PostRoutes from './domain/post/post.controller'

export default function useRoutes(app) {
  // seem like group 2nd params must return app value
  return (
    app.get('/', async () => `Hello elysia`)
      .group('/user', UserRoutes)
      .group('/category', CategoryRoutes)
      .group('/post', PostRoutes)
  )
}