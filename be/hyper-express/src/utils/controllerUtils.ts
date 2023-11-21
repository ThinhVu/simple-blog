//import {Response} from 'express'
import {Response} from 'hyper-express/types/components/http/Response';
export const internalError = (e: string, res: Response) => {
   console.error(e)
   res.status(500, e)
}