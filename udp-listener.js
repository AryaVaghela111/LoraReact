// udp-listener.js
import { createSocket } from 'dgram';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Packet from './models/Packet.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const udpServer = createSocket('udp4');

udpServer.on('message', async (msg) => {
  const payload = msg.slice(12);
  try {
    const json = JSON.parse(payload);
    if (!json.rxpk) return;

    for (const pkt of json.rxpk) {
      const decodedStr = Buffer.from(pkt.data, 'base64').toString('utf-8');
      const timestamp = new Date().toISOString();
      const frequency = pkt.freq;

      console.log(`[UDP] ${decodedStr} (RSSI: ${pkt.rssi}, Freq: ${frequency})`);

      const newPacket = new Packet({ timestamp, message: decodedStr, frequency });
      await newPacket.save();
    }
  } catch (err) {
    console.error(`❌ Failed to parse UDP payload: ${err.message}`);
  }
});

udpServer.bind(1700, () => {
  console.log(`🛰️ Listening for LoRa UDP packets on port 1700`);
});
