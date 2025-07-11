import { configDotenv } from 'dotenv';
const mongodb = require('mongodb');
configDotenv();

let cachedDb: any = null;

export const connectToDb = async () => {
  if (cachedDb) return cachedDb;
  const uri = process.env.ATLAS_URI;
  if (!uri) throw new Error("Missing ATLAS_URI");

  const client = new mongodb.MongoClient(uri, {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  cachedDb = client.db("tracker_test");
  return cachedDb;
};

export default connectToDb;
