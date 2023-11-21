import dotenv from 'dotenv';

dotenv.config();


import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import router from './routes';
import initDb from './utils/connection';
import {Server} from 'hyper-express';



process.on('uncaughtException', function (err) {
   console.error((err && err.stack) ? err.stack : err);
});

initDb().then(async () => {
   const app = new Server()
   app.use(cors());
   app.use('/', router);

   const PORT = process.env.PORT || process.env.API_PORT;
   app.listen(parseInt(PORT,10),()=> {
      console.log(`httpServer ready at http://localhost:${PORT}`);
   });
})
