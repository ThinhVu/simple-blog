import cors from 'cors';
import router from './routes';
import {Server} from 'hyper-express';

export default async function () {
  const app = new Server()
  app.use(cors());
  app.use('/', router);
  app.set_not_found_handler(() => {})
  app.set_error_handler(() => {})
  return app
}
