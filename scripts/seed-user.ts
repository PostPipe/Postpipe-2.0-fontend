import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'postpipe'; // Auth uses the 'postpipe' database

async function seedUser() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const email = 'postpipe@admin.com';
    const password = 'password123';
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log(`User ${email} already exists!`);
      return;
    }

    // Hash the password just like the app does
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into MongoDB
    await usersCollection.insertOne({
      name: 'Test User',
      email: email,
      password: hashedPassword,
      isVerified: true, // Bypass the email verification step
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`✅ Successfully created test user!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('❌ Error seeding user:', error);
  } finally {
    await client.close();
  }
}

seedUser();
