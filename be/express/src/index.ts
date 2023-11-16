import app from './app'
import {createServer} from 'http';

process.on('uncaughtException', function (err) {
   console.error((err && err.stack) ? err.stack : err)
})
const PORT = process.env.PORT || process.env.API_PORT
const httpServer = createServer(app)
httpServer.listen({port: PORT}, () => console.log(`httpServer ready at http://localhost:${PORT}`))