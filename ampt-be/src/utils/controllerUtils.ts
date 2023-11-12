import {Response} from 'express'

export const internalError = (e: Error | string, res: Response) => {
   console.error(e)
   res.status(500).send({error: typeof(e) === 'string' ? e : e.message})
}
