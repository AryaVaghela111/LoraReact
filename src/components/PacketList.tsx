import { VStack } from "@chakra-ui/react";
import PacketCard from "./PacketCard";

const dummyPackets = [
  { time: "14:00", data: "ABCD1234" },
  { time: "14:01", data: "FFEE5678" },
];

const PacketList = () => (
  <VStack align="stretch" p={4}>
    {dummyPackets.map((packet, idx) => (
      <PacketCard key={idx} time={packet.time} data={packet.data} />
    ))}
  </VStack>
);

export default PacketList;
