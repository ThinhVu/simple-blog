import cors from 'cors';
import router from './routes';
import {Server} from 'hyper-express';

export default async function () {
  const app = new Server()
  app.use(cors());
  app.use('/', router);
  app.set_not_found_handler((req, res) => {
    console.error('not found routs', req, res)
    res.status(400).json({error: 'not found'})
  })
  app.set_error_handler((req, res, error) => {
    console.error('error handler trigger', error)
    res.status(500).json({error})
  })
  return app
}
