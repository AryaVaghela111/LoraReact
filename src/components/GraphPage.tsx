import { Box, Flex, Text, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FrequencyFilter from './FrequencyFilter';

type Packet = {
  _id: string;
  timestamp: string;
  message: string;
  frequency: number;
};

const GraphPage = () => {
  const { frequency } = useParams();
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackets = async () => {
      try {
        setLoading(true);
        let url = '/packets?limit=1000'; // Get more data for graphs
        if (frequency) {
          url += `&frequency=${frequency}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        setPackets(Array.isArray(data.packets) ? data.packets : []);
      } catch (err) {
        console.error('Failed to load packets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPackets();
  }, [frequency]);

  // Simple graph visualization - you can replace this with a proper chart library
  const renderGraph = () => {
    if (loading) return <Spinner size="lg" />;
    
    // Group by frequency and count
    const frequencyCounts = packets.reduce((acc, packet) => {
      acc[packet.frequency] = (acc[packet.frequency] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return (
      <Box mt={4}>
        <Text fontSize="xl" mb={4}>Packet Frequency Distribution</Text>
        {Object.entries(frequencyCounts).map(([freq, count]) => (
          <Box key={freq} mb={2}>
            <Text>{freq} MHz: {count} packets</Text>
            <Box 
              height="20px" 
              bg="teal.500" 
              width={`${Math.min(100, count)}%`} 
              borderRadius="md"
            />
          </Box>
        ))}
      </Box>
    );
  };

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
          selectedFrequencies={frequency ? [parseFloat(frequency)] : []}
          onChange={(freqs) => {
            // This would navigate to the selected frequency's graph
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
        <Text fontSize="2xl" mb="4" fontWeight="bold">
          📊 Packet Frequency Analysis
        </Text>
        {renderGraph()}
      </Box>
    </Flex>
  );
};

export default GraphPage;