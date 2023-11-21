import dotenv from 'dotenv';
import { Elysia } from "elysia";
import {cors} from '@elysiajs/cors';
import routers from './routes';
import initDb from './utils/connection';

export default async function createApp() {
  dotenv.config()
  await initDb()
  const app = new Elysia();
  app.use(cors())
  app.use('/', routers)
  return app;
}