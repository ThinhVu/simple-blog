import {Elysia} from 'elysia';
import {jwt} from "@elysiajs/jwt";
import {bearer} from "@elysiajs/bearer";

const plugin = new Elysia()
  .use(jwt({
    name: 'jwt',
    exp: '7d',
    secret: process.env.SECRET || ''
  }))
  .use(bearer())
  .derive(({bearer, jwt}) => {
    return {
      getAuthUser: async () => {
        if (!bearer) throw 'INVALID_USER'
        // @ts-ignore
        const {user} = await jwt.verify(bearer);
        if (!user) throw 'INVALID_USER'
        return user
      }
    }
  })

export default plugin