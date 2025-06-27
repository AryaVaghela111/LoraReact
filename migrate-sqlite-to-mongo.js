import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const runMigration = async () => {
  // 1. Connect to SQLite
  const db = await open({
    filename: './packets.db',
    driver: sqlite3.Database
  });

  // 2. Connect to MongoDB
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ Connected to MongoDB');

  // 3. Define Mongo Schema
  const packetSchema = new mongoose.Schema({
    timestamp: Date,
    message: String,
    frequency: Number,
  });

  const Packet = mongoose.model('Packet', packetSchema);

  // 4. Fetch all data from SQLite
  const rows = await db.all(`SELECT * FROM packets`);
  console.log(`📦 Found ${rows.length} packets in SQLite`);

  // 5. Insert into MongoDB
  for (const row of rows) {
    await Packet.create({
      timestamp: new Date(row.timestamp),
      message: row.message,
      frequency: row.frequency,
    });
  }

  console.log(`✅ Migrated ${rows.length} packets to MongoDB`);

  // 6. Close connections
  await mongoose.disconnect();
  await db.close();
};

runMigration().catch(console.error);
