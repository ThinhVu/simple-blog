import cors from 'cors';
import router from './routes';
import {Server} from 'hyper-express';
import {Server as SocketIoServer} from 'socket.io';

export default async function () {
  const app = new Server()
  app.use(cors())
  app.use('/', router)
  const io = new SocketIoServer({
    cors: {origin: "http://localhost:8080"}
  })
  io.attachApp(app.uws_instance)
  // @ts-ignore
  io.on("connection", (socket) => {
    console.log('new socket received', socket)
    socket.emit('hi-mom', 'hyper-express')
  });
  return app
}
