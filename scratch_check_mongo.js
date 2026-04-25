
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const dbNames = ['postpipe', 'postpipe_core'];
        
        for (const dbName of dbNames) {
            const db = client.db(dbName);
            console.log(`\n--- Checking DB: ${dbName} ---`);
            
            const userForms = await db.collection('user_forms').find({}).toArray();
            console.log(`Found ${userForms.length} documents in user_forms`);

            for (const doc of userForms) {
                for (const form of doc.forms) {
                    if (form.id === 'valorant-player-info-1') {
                        console.log(`Found form: ${form.id}`);
                        console.log(`Submission count: ${form.submissionCount}`);
                        console.log(`Submissions in array: ${form.submissions?.length || 0}`);
                        if (form.submissions?.length > 0) {
                            console.log('First 3 submissions data:');
                            form.submissions.slice(0, 3).forEach((s, i) => {
                                console.log(`[${i}]`, JSON.stringify(s.data, null, 2));
                            });
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
