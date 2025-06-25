import { Box, Stack, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import FrequencyFilter from './FrequencyFilter';
import PacketTable from './PacketTable';

type Packet = {
  id: number;
  timestamp: string;
  message: string;
  frequency: number;
};

const Dashboard = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>([]);

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

  const filteredPackets =
    selectedFrequencies.length === 0
      ? packets
      : packets.filter((p) => selectedFrequencies.includes(p.frequency));

  return (
    <Flex flex="1">
      <Box
        minW="220px"
        borderRight="1px solid #444"
        px={4}
        py={6}
        bg="gray.900"
      >
        <FrequencyFilter
          packets={packets}
          selectedFrequencies={selectedFrequencies}
          onChange={setSelectedFrequencies}
        />
      </Box>

      <Box flex="1" px={6} py={6}>
        <PacketTable packets={filteredPackets} loading={loading} />
      </Box>
    </Flex>
  );
};

export default Dashboard;
