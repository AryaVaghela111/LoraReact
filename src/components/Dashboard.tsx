import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import FrequencyFilter from './FrequencyFilter';
import PacketTable from './PacketTable';

type Packet = {
  _id: string;
  timestamp: string;
  message: string;
  frequency: number;
};

const Dashboard = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>([]);

  const loadPackets = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/packets?page=${pageNum}&limit=25`);
      const data = await res.json();

      setPackets(data.packets);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error('❌ Failed to load packets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackets(1);
  }, []);

  // Apply filtering on the currently fetched page
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
        <PacketTable
          packets={filteredPackets}
          loading={loading}
          page={page}
          pages={pages}
          onPageChange={(newPage) => loadPackets(newPage)}
        />
      </Box>
    </Flex>
  );
};

export default Dashboard;
