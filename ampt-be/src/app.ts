import express from "express";
import router from './routes';
import mongoDBAtlas from "./middlewares/mongo-atlas";

const app = express();
app.use(express.json({limit: '1mb'}))
app.use(express.urlencoded({limit: '1mb', extended: true, parameterLimit: 50000}))
app.use('/', mongoDBAtlas({
    defaultDb: "test", // provide is default db to use
    realmAppId: process.env.REALM_APP_ID,
    realmApiKey: process.env.REALM_API_KEY,
}), router)

export default app