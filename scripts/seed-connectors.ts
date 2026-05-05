import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'postpipe_core';

async function seedConnectors() {
  console.log(`Connecting to ${uri}...`);
  const client = new MongoClient(uri);

  try {
    const authDb = client.db('postpipe');
    const coreDb = client.db(dbName);
    
    // First, find our admin user to get their actual ID
    const user = await authDb.collection('users').findOne({ email: 'postpipe@admin.com' });
    
    if (!user) {
      console.error('❌ Admin user not found. Please run npm run db:seed-user first.');
      return;
    }

    const userId = user._id.toString();
    const connectorsCollection = coreDb.collection<any>('user_connectors');
    
    console.log(`Found user ${userId}. Inserting mock connectors...`);
    
    await connectorsCollection.updateOne(
      { userId },
      {
        $push: {
          connectors: {
            $each: [
              {
                id: `conn_${Math.random().toString(36).substr(2, 9)}`,
                secret: `sk_live_mock_${Math.random().toString(36).substr(2, 16)}`,
                url: 'http://localhost:3000',
                name: 'Local Dev App',
                envPrefix: 'DEV'
              },
              {
                id: `conn_${Math.random().toString(36).substr(2, 9)}`,
                secret: `sk_live_mock_${Math.random().toString(36).substr(2, 16)}`,
                url: 'https://api.postpipe.app',
                name: 'Production App',
                envPrefix: 'PROD'
              },
              {
                id: `conn_${Math.random().toString(36).substr(2, 9)}`,
                secret: `sk_live_mock_${Math.random().toString(36).substr(2, 16)}`,
                url: 'https://staging.api.postpipe.app',
                name: 'Staging Environment',
                envPrefix: 'STAG'
              }
            ]
          }
        }
      } as any,
      { upsert: true }
    );

    console.log(`✅ Mock connectors successfully added to the dashboard for postpipe@admin.com!`);

  } catch (error) {
    console.error('❌ Error connecting or inserting data:', error);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

seedConnectors();
