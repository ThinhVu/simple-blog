import { http } from "@ampt/sdk";
import dotenv from 'dotenv';
dotenv.config();
import app from './src/app'
http.node.use(app);
