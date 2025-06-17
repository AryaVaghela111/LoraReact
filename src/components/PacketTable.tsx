import {
  Box,
  Spinner,
  Text,
  Table,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

type Packet = {
  id: number;
  timestamp: string;
  message: string;
  frequency: number;
};

const PacketTable = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPackets = async () => {
    try {
      const res = await fetch('/packets');
      const data = await res.json();
      setPackets(data);
      setLoading(false);
    } catch (err) {
      console.error('⚠️ Failed to load packets:', err);
    }
  };

  useEffect(() => {
    loadPackets();
    const interval = setInterval(loadPackets, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box p="4" bg="white" _dark={{ bg: 'gray.800' }} rounded="lg" shadow="md">
      <Text fontSize="2xl" mb="4" fontWeight="bold">
        📡 LoRaWAN Packet Log
      </Text>

      {loading ? (
        <Spinner size="lg" />
      ) : (
        <Table.Root variant="line" size="md">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>Timestamp</Table.ColumnHeader>
              <Table.ColumnHeader>Message</Table.ColumnHeader>
              <Table.ColumnHeader>Frequency (MHz)</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {packets.map((pkt) => (
              <Table.Row key={pkt.id}>
                <Table.Cell>{pkt.id}</Table.Cell>
                <Table.Cell>{pkt.timestamp}</Table.Cell>
                <Table.Cell>{pkt.message}</Table.Cell>
                <Table.Cell>{pkt.frequency}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
};

export default PacketTable;
