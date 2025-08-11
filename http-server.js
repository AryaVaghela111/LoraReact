// http-server.js
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Packet from './models/Packet.js';
import { parse, isValid } from 'date-fns';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });
const clients = new Set();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => fastify.log.info('✅ MongoDB connected'))
  .catch(err => fastify.log.error('❌ MongoDB connection error:', err));

// Static React build
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'dist'),
  prefix: '/',
});

// WebSocket
fastify.register(fastifyWebsocket);
fastify.get('/ws', { websocket: true }, (connection) => {
  clients.add(connection.socket);
  connection.socket.on('close', () => clients.delete(connection.socket));
});

// Parse search helper
function parseDateFromSearch(search) {
  const formats = [
    "d MMMM", "do MMMM", "h:mm a d MMMM", "h:mm a do MMMM",
    "MMMM d, yyyy", "yyyy-MM-dd"
  ];
  for (const fmt of formats) {
    const parsed = parse(search, fmt, new Date());
    if (isValid(parsed)) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  return null;
}

// REST API
fastify.get('/packets', async (request, reply) => {
  const { page = 1, limit = 25, search = '' } = request.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const searchDate = parseDateFromSearch(search);

  let query = {};
  if (searchDate) {
    query.timestamp = {
      $gte: new Date(`${searchDate}T00:00:00.000Z`),
      $lte: new Date(`${searchDate}T23:59:59.999Z`),
    };
  } else if (search) {
    query = { message: { $regex: search, $options: 'i' } };
  }

  const packets = await Packet.find(query).sort({ _id: -1 }).skip(skip).limit(parseInt(limit));
  const total = await Packet.countDocuments(query);

  reply.send({
    packets,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  });
});

// Start HTTP server
fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
