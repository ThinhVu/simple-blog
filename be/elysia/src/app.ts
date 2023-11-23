import dotenv from 'dotenv';
import {Elysia} from "elysia";
import routers from './routes';
import initDb from './utils/connection';
import {cors} from '@elysiajs/cors';
import {swagger} from '@elysiajs/swagger'
import AuthPlugin from './plugin/auth'

export default async function createApp() {
  dotenv.config()
  await initDb()
  const app = new Elysia();
  app
    .use(cors())
    .use(swagger())
    .use(AuthPlugin)
    .use(routers)
  return app;
}