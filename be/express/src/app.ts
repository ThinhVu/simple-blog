import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import router from './routes';
import initDb from './utils/connection';

export default async function createApp() {
  dotenv.config();
  await initDb()
  const app = express()
  app.use(compression())
  app.use(cookieParser())
  app.use(cors())
  app.use(express.json({limit: '50mb'}))
  app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}))
  app.use('/', router)
  return app;
}