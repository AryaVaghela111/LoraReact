import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import { createSocket } from 'dgram';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });
const udpServer = createSocket('udp4');
const clients = new Set();

// Serve React app build (make sure to run `vite build`)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'dist'), // vite build output
  prefix: '/',
  wildcard: false,
});

// WebSocket for live packet updates
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
fastify.get('/packets', async (request, reply) => {
  try {
    const dbInstance = await db;
    const rows = await dbInstance.all(`SELECT * FROM packets ORDER BY id DESC LIMIT 20`);
    return rows;
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: 'Failed to retrieve packets' });
  }
});

// UDP listener (Semtech format)
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

      console.log(`[UDP] ${decodedStr} (RSSI: ${pkt.rssi}, Freq: ${pkt.freq})`);

      const dbInstance = await db;
      await dbInstance.run(
        `INSERT INTO packets (timestamp, message, frequency) VALUES (?, ?, ?)`,
        [timestamp, decodedStr, frequency]
      );

      const packet = { timestamp, message: decodedStr, frequency };

      // Send to all connected WebSocket clients
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

// Start server
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
