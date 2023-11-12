import {AsyncLocalStorage} from 'node:async_hooks';

const storage = new AsyncLocalStorage()

export function Model(name: string) {
    // @ts-ignore
    return storage.getStore().$mongo.getCollection(name)
}

export function mongoCtx(fn: any) {
    return async (req: any, res: any) : Promise<void> => {
        try {
            // because mongodb middleware inject $mongo field to req
            // so we need to pass req object as async storage context
            await storage.run(req, () => fn(req, res))
        } catch(e: any) {
            req.status(400).send({error: e.message})
        }
    }
}
