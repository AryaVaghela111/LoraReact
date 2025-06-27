
import mongoose from 'mongoose';

const packetSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  message: String,
  frequency: Number,
});

const Packet = mongoose.model('Packet', packetSchema);

export default Packet;
