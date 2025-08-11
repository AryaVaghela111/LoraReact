import {
  Box,
  Button,
  Collapsible,
  Flex,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FrequencyFilter from './FrequencyFilter';
import PacketTable from './PacketTable';
import AutoRefreshToggle from './AutoRefreshToggle';
import { useAutoRefresh } from './AutoRefreshContext';
import FilterById from './FilterById';

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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Collapsible states
  const [showIdFilter, setShowIdFilter] = useState(true);
  const [showFreqFilter, setShowFreqFilter] = useState(true);

  const loadPackets = async (
    pageNum: number = 1,
    currentSearch = search,
    currentFreqs = selectedFrequencies
  ) => {
    try {
      const freqParam =
        currentFreqs.length > 0
          ? `&frequencies=${currentFreqs.join(',')}`
          : '';
      const res = await fetch(
        `/packets?page=${pageNum}&limit=25&search=${encodeURIComponent(
          currentSearch
        )}${freqParam}&sort=-timestamp`
      );
      const data = await res.json();
      
      setPackets(Array.isArray(data.packets) ? data.packets : []);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error('❌ Failed to load packets:', err);
    }
  };

  const { isAutoRefresh } = useAutoRefresh();

  useEffect(() => {
    loadPackets(page, search, selectedFrequencies);

    if (!isAutoRefresh) return;

    const intervalId: number = window.setInterval(
      () => loadPackets(page, search, selectedFrequencies),
      3000
    );

    return () => clearInterval(intervalId);
  }, [page, search, selectedFrequencies, isAutoRefresh]);

  const filteredPackets = packets
    .filter((p) =>
      selectedFrequencies.length === 0
        ? true
        : selectedFrequencies.includes(p.frequency)
    )
    .filter((p) => {
      if (selectedIds.length === 0) return true;
      const match = p.message.match(/id:\s*(\d+)/i);
      const id = match ? parseInt(match[1], 10) : null;
      return id !== null && selectedIds.includes(id);
    });
    console.log(filteredPackets);
    
    

  return (
    <Flex flex="1">
      {/* Sidebar */}
      <Box
        minW="220px"
        borderRight="1px solid #444"
        px={4}
        py={6}
        bg="gray.900"
      >
        <Box mb={4}>
          <Link to="/graphs">
            <Button>View Graphs →</Button>
          </Link>
        </Box>

        <AutoRefreshToggle />

        {/* Filter by Device ID */}
        <Box mb={4} mt={4}>
          <Collapsible.Root
            open={showIdFilter}
            onOpenChange={(details) => setShowIdFilter(details.open)}
          >
            <Collapsible.Trigger asChild>
              <Flex
                align="center"
                justify="space-between"
                cursor="pointer"
                bg="gray.600"
                p={2}
                rounded="md"
              >
                <Text fontWeight="bold" color="white">
                  Filter by Device ID
                </Text>
                {showIdFilter ? (
                  <ChevronUp color="white" />
                ) : (
                  <ChevronDown color="white" />
                )}
              </Flex>
            </Collapsible.Trigger>

            <Collapsible.Content>
              <Box mt={2}>
                <FilterById
                  packets={packets}
                  selectedIds={selectedIds}
                  onChange={(newIds) => setSelectedIds(newIds)}
                />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>

        {/* Filter by Frequency */}
        <Box mb={4}>
          <Collapsible.Root
            open={showFreqFilter}
            onOpenChange={(details) => setShowFreqFilter(details.open)}
          >
            <Collapsible.Trigger asChild>
              <Flex
                align="center"
                justify="space-between"
                cursor="pointer"
                bg="gray.600"
                p={2}
                rounded="md"
              >
                <Text fontWeight="bold" color="white">
                  Filter by Frequency
                </Text>
                {showFreqFilter ? (
                  <ChevronUp color="white" />
                ) : (
                  <ChevronDown color="white" />
                )}
              </Flex>
            </Collapsible.Trigger>

            <Collapsible.Content>
              <Box mt={2}>
                <FrequencyFilter
                  packets={packets}
                  selectedFrequencies={selectedFrequencies}
                  onChange={(newFreqs) => {
                    setSelectedFrequencies(newFreqs);
                    loadPackets(1, search, newFreqs);
                  }}
                />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>
      </Box>

      {/* Main Content */}
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
