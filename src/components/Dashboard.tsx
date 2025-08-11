import { Box, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import FrequencyFilter from './FrequencyFilter';
import PacketTable from './PacketTable';
import { Link } from 'react-router-dom';

type Packet = {
  _id: string;
  timestamp: string;
  message: string;
  frequency: number;
};

const Dashboard = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>([]);

  const loadPackets = async (pageNum: number = 1, currentSearch = search) => {
    try {
      const res = await fetch(
        `/packets?page=${pageNum}&limit=25&search=${encodeURIComponent(currentSearch)}&sort=-timestamp`
      );
      const data = await res.json();
      setPackets(Array.isArray(data.packets) ? data.packets : []);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error('❌ Failed to load packets:', err);
    } finally {
    }
  };

  useEffect(() => {
    loadPackets(1); // initial fetch
    const intervalId: number = window.setInterval(
      () => loadPackets(page, search),
      3000
    );
    return () => clearInterval(intervalId);
  }, [page, search]);

  // Apply frequency filter *after* fetching
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
        <Box mb={4}>
          <Link to="/graphs">
            <Text color="blue.400">View Graphs →</Text>
          </Link>
        </Box>
        <FrequencyFilter
          packets={packets}
          selectedFrequencies={selectedFrequencies}
          onChange={setSelectedFrequencies}
        />
      </Box>

      <Box flex="1" px={6} py={6}>
        <PacketTable
          packets={filteredPackets}
          page={page}
          pages={pages}
          search={search}
          setSearch={setSearch}
          onSearch={(newSearch) => loadPackets(1, newSearch)}
          onPageChange={(newPage) => loadPackets(newPage)}
        />
      </Box>
    </Flex>
  );
};

export default Dashboard;
