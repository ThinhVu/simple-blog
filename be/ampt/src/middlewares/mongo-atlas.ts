import * as RealmWeb from 'realm-web'

import RealmServices = Realm.Services
import MongoDB = RealmServices.MongoDB

type MongoDBDatabase = RealmServices.MongoDBDatabase
type Document = MongoDB.Document

let App: RealmWeb.App
let user
let client: MongoDB
const dbCache: Record<string, MongoDBDatabase> = {}
const collectionCache: Record<string, MongoDB.MongoDBCollection<Document>> = {}
let getDb: (name: string) => MongoDBDatabase,
    getCollection: <T extends Document>(collectionName: string, dbName?: string) => MongoDB.MongoDBCollection<T>;

export interface IMongoDBAtlasOptions {
    defaultDb?: string; // provide is default db to use
    realmAppId?: string; // if missing, you need to provide REALM_APP_ID in Bindings
    realmApiKey?: string; // if missing, you need to provide REALM_API_KEY in Bindings
}

export default function mongoDBAtlasMiddleware(options?: IMongoDBAtlasOptions) {
    return async function(req: any, res: any, next: any) {
        try {
            if (!App) {
                const opts = options || {}
                const realmAppId = opts.realmAppId || process.env.REALM_APP_ID
                if (!realmAppId)
                    throw new Error('options.realmAppId and env.REALM_APP_ID is not configured')

                const realmApiKey = opts.realmApiKey || process.env.REALM_API_KEY
                if (!realmApiKey)
                    throw new Error('options.realmApiKey and env.REALM_API_KEY is not configured')

                App = new RealmWeb.App(realmAppId)
                user = await App.logIn(RealmWeb.Credentials.apiKey(realmApiKey))
                // see App Services / Linked Data Source
                // you may need to create new one if service is not exist
                const serviceName = 'testdb'
                client = user.mongoClient(serviceName)

                getDb = function(name: string): MongoDBDatabase {
                    if (!dbCache[name])
                        dbCache[name] = client.db(name)
                    return dbCache[name]
                }

                getCollection =  function<T extends Document>(collectionName: string, dbName?: string): MongoDB.MongoDBCollection<T> {
                    dbName = dbName || opts.defaultDb;
                    if (!dbName)
                        throw new Error('defaultDb is not configured, you need to provide dbName explicitly')
                    const key = `${dbName}--${collectionName}`
                    if (!collectionCache[key])
                        collectionCache[key] = getDb(dbName).collection(collectionName)
                    return collectionCache[key] as MongoDB.MongoDBCollection<T>
                }
            }

            req.$mongo = {
                getDb,
                getCollection
            }

            next()
        } catch (e: any) {
            req.$mongo = {
                message: 'something bad happened',
                error: e.message || e
            }
            next(e)
        }
    }
}