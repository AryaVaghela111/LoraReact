import { Box, Button, Flex} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FrequencyFilter from './FrequencyFilter';
import SensorGraphs from './sensorGraphs';
import { useAutoRefresh } from './AutoRefreshContext';
import AutoRefreshToggle from './AutoRefreshToggle';
import { ArrowLeft } from 'lucide-react';

type Packet = {
  _id: string;
  timestamp: string;
  message: string;
  frequency: number;
};

const SensorGraphsPage = () => {
  const { frequency } = useParams();
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState<number[]>(
    frequency ? [parseFloat(frequency)] : []
  );
  const { isAutoRefresh } = useAutoRefresh();

  const loadPackets = async (currentFreqs = selectedFrequencies) => {
    try {
      const freqParam =
        currentFreqs.length > 0
          ? `&frequencies=${currentFreqs.join(',')}`
          : '';
      const res = await fetch(`/packets?limit=1000${freqParam}`);
      const data = await res.json();

      setPackets(Array.isArray(data.packets) ? data.packets : []);
    } catch (err) {
      console.error('❌ Failed to load packets:', err);
    }
  };

  useEffect(() => {
    // Initial load
    loadPackets(selectedFrequencies);

    if (!isAutoRefresh) return;

    const intervalId: number = window.setInterval(
      () => loadPackets(selectedFrequencies),
      3000
    );

    return () => clearInterval(intervalId);
  }, [selectedFrequencies, isAutoRefresh]);

  return (
    <Flex flex="1">
      <Box
        minW="220px"
        borderRight="1px solid #444"
        px={4}
        py={6}
        bg="gray.900"
      >
        <Box mt={4}>
  <Link to="/">
    <Button>
      <ArrowLeft />
      Back to Dashboard
    </Button>
  </Link>
</Box>
        <FrequencyFilter
          packets={packets}
          selectedFrequencies={selectedFrequencies}
          onChange={(newFreqs) => {
            setSelectedFrequencies(newFreqs);
            loadPackets(newFreqs);
          }}
        />
        <AutoRefreshToggle />
      </Box>

      <Box flex="1" px={6} py={6}>
        <SensorGraphs packets={packets} />
      </Box>
    </Flex>
  );
};

export default SensorGraphsPage;
