import { MongoClient } from 'mongodb';

async function debugData() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'postpipe_core';
    
    if (!uri) {
        console.error('MONGODB_URI missing');
        return;
    }

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        
        console.log('--- FINDING PIKO FIRST TEST ---');
        const formDoc = await db.collection('user_forms').findOne({ "forms.name": "PIKO FIRST TEST" });
        if (!formDoc) {
            console.log('Form not found by name "PIKO FIRST TEST"');
        } else {
            const form = formDoc.forms.find((f: any) => f.name === "PIKO FIRST TEST");
            console.log('Form details:', JSON.stringify(form, null, 2));
            
            const userId = form.userId;
            console.log('\n--- FINDING CONNECTORS FOR USER', userId, '---');
            const connectorsDoc = await db.collection('user_connectors').findOne({ userId });
            console.log('User connectors:', JSON.stringify(connectorsDoc?.connectors || [], null, 2));
            
            if (form.connectorId) {
                const connExists = (connectorsDoc?.connectors || []).find((c: any) => c.id === form.connectorId);
                console.log('\nIs form.connectorId (' + form.connectorId + ') in user connectors?', !!connExists);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

debugData();
