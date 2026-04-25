
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('postpipe_core');
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        for (const coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`${coll.name}: ${count} docs`);
            if (count > 0) {
                const sample = await db.collection(coll.name).findOne({});
                console.log(`Sample from ${coll.name}:`, JSON.stringify(sample, null, 2).slice(0, 200));
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
