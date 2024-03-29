import {Response} from 'hyper-express';

export const internalError = (e: Error | string, res: Response) => {
   console.error(e)
   res.status(500, typeof(e) === 'string' ? e : e.message).end()
}