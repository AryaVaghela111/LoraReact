import { Box, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FrequencyFilter from './FrequencyFilter';
import SensorGraphs from './sensorGraphs';

type Packet = {
  _id: string;
  timestamp: string;
  message: string;
  frequency: number;
};

const SensorGraphsPage = () => {
  const { frequency } = useParams();
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>([]);

  useEffect(() => {
  let intervalId: number;

  const loadPackets = async () => {
    try {
      let url = '/packets?limit=1000'; // Get more data for graphs
      if (frequency) {
        url += `&frequency=${frequency}`;
        setSelectedFrequencies([parseFloat(frequency)]);
      }

      const res = await fetch(url);
      const data = await res.json();

      // Optional: Only update if there's actually new data
      setPackets(prevPackets => {
        if (JSON.stringify(prevPackets) !== JSON.stringify(data.packets)) {
          return Array.isArray(data.packets) ? data.packets : [];
        }
        return prevPackets;
      });

    } catch (err) {
      console.error('Failed to load packets:', err);
    }
  };

  // Initial load
  loadPackets();

  // Poll every 3 seconds
  intervalId = setInterval(loadPackets, 3000);

  // Cleanup on unmount
  return () => clearInterval(intervalId);
}, [frequency]);

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
          onChange={(freqs) => {
            // Navigate to the selected frequency's graph
            if (freqs.length > 0) {
              window.location.href = `/graphs/${freqs[0]}`;
            } else {
              window.location.href = '/graphs';
            }
          }}
        />
        <Box mt={4}>
          <Link to="/">
            <Text color="blue.400">← Back to Dashboard</Text>
          </Link>
        </Box>
      </Box>

      <Box flex="1" px={6} py={6}>
        <SensorGraphs packets={packets} />
      </Box>
    </Flex>
  );
};

export default SensorGraphsPage;