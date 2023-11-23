import dotenv from 'dotenv';
import initDb from './utils/connection';
import createApp from './app'

async function main() {
   dotenv.config()
   await initDb()
   const app = await createApp()
   const PORT = +(process.env.PORT || process.env.API_PORT) || 8080;
   await app.listen(PORT)
   console.log(`httpServer ready at http://localhost:${PORT}`)
}

main()
