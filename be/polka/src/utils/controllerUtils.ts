//import {Response} from 'express'
//remove Response in line 3

export const internalError = (e: Error | string, res) => {
   console.error(e)
   res.statusCode = 500;
   const errorMessage = { error: typeof e === 'string' ? e : e.message };
   const jsonResponse = JSON.stringify(errorMessage);
   res.end(jsonResponse);
}
