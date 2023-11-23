import mongoose from 'mongoose';

export default async function initDb(): Promise<any> {
  try {
    console.log('Connecting to db', process.env.MONGO_URL)
    const db = await mongoose.connect(process.env.MONGO_URL!);
    console.log('DB connected');
    return db
  } catch (error) {
    console.error('DB connection failed', error);
    process.exit(1);
  }
}
