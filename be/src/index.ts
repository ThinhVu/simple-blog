import dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import {createServer} from 'http';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import router from './routes';
import initDb from './utils/connection';

process.on('uncaughtException', function (err) {
   console.error((err && err.stack) ? err.stack : err);
});

initDb().then(async () => {
   const app = express()
   app.use(compression())
   app.use(cookieParser())
   app.use(cors())
   app.use(express.json({limit: '50mb'}))
   app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}))
   app.use('/', router)

   const PORT = process.env.PORT || process.env.API_PORT;
   const httpServer = createServer(app);
   httpServer.listen({port: PORT}, () => console.log(`httpServer ready at http://localhost:${PORT}`));
})
