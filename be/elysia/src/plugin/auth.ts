import {Elysia, type Context} from 'elysia';
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
      getUser: () => {
        if (!bearer) throw 'INVALID_USER'
        const {user, exp} = jwt.decode(bearer);
        const expired = Date.now() > exp * 1000;
        if (!user) throw 'INVALID_USER'
        if (expired) throw 'EXPIRED_TOKEN'
        return user
      }
    }
  })

export default plugin