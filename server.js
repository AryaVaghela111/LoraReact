import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import { createSocket } from 'dgram';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Packet from './models/Packet.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI;

const fastify = Fastify({ logger: true });
const udpServer = createSocket('udp4');
const clients = new Set();

// MongoDB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});


// Serve React app
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'dist'),
  prefix: '/',
  wildcard: false,
});

// WebSocket for live updates
fastify.register(fastifyWebsocket);
fastify.get('/ws', { websocket: true }, (connection) => {
  fastify.log.info('🌐 WebSocket client connected');
  clients.add(connection.socket);

  connection.socket.on('close', () => {
    fastify.log.info('❌ WebSocket client disconnected');
    clients.delete(connection.socket);
  });
});

// REST API to fetch all stored packets
// REST API with pagination
fastify.get('/packets', async (request, reply) => {
  try {
    const { page = 1, limit = 25 } = request.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const packets = await Packet.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Packet.countDocuments();
    console.log(`This is total ${total} `);

    const pages = Math.ceil(total / limit);
console.log(`📊 Total: ${total}, Limit: ${limit}, Pages: ${pages}`);

    reply.send({
      packets,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: 'Failed to retrieve packets' });
  }
});

// UDP listener for LoRa messages
udpServer.on('message', async (msg, rinfo) => {
  const payload = msg.slice(12); // Semtech UDP header is 12 bytes
  try {
    const json = JSON.parse(payload);
    if (!json.rxpk) return;

    for (const pkt of json.rxpk) {
      const decodedBytes = Buffer.from(pkt.data, 'base64');
      const decodedStr = decodedBytes.toString('utf-8');
      const timestamp = new Date().toISOString();
      const frequency = pkt.freq;

      console.log(`[UDP] ${decodedStr} (RSSI: ${pkt.rssi}, Freq: ${frequency})`);

      // Save to MongoDB
      const newPacket = new Packet({
        timestamp,
        message: decodedStr,
        frequency,
      });
      await newPacket.save();

      // Send to all WebSocket clients
      const packet = { timestamp, message: decodedStr, frequency };
      clients.forEach((client) => {
        client.send(JSON.stringify(packet));
      });
    }
  } catch (err) {
    fastify.log.error(`❌ Failed to parse UDP payload: ${err.message}`);
  }
});

udpServer.bind(1700, () => {
  console.log(`🛰️  Listening for LoRa UDP packets on port 1700`);
});

// Start HTTP server
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
