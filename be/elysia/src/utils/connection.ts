import mongoose from 'mongoose';

export default async function initDb(): Promise<any> {
  try {
    const db = await mongoose.connect(process.env.MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
<<<<<<< HEAD
      family: 4,
=======
>>>>>>> c49986eb039f5ee5e607434fad6695d8a2418eff
    });
    console.log('DB connected');
    return db
  } catch (error) {
    console.error('DB connection failed', error);
    process.exit(1);
  }
}
