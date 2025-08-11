import {
  Box,
  Button,
  Flex,
  Collapsible,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import FrequencyFilter from "./FrequencyFilter";
import FilterById from "./FilterById";
import SensorGraphs from "./sensorGraphs";
import { useAutoRefresh } from "./AutoRefreshContext";
import AutoRefreshToggle from "./AutoRefreshToggle";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { isAutoRefresh } = useAutoRefresh();

  const [showFreqFilter, setShowFreqFilter] = useState(true);
  const [showIdFilter, setShowIdFilter] = useState(true);

  const loadPackets = async (currentFreqs = selectedFrequencies) => {
  try {
    const freqParam =
      currentFreqs.length > 0
        ? `&frequencies=${currentFreqs.join(",")}`
        : "";
    const res = await fetch(`/packets?limit=1000${freqParam}&sort=-timestamp`);
    const data = await res.json();
    setPackets(Array.isArray(data.packets) ? data.packets : []);
  } catch (err) {
    console.error("❌ Failed to load packets:", err);
  }
};


  useEffect(() => {
    loadPackets(selectedFrequencies);

    if (!isAutoRefresh) return;
    const intervalId: number = window.setInterval(
      () => loadPackets(selectedFrequencies),
      3000
    );
    return () => clearInterval(intervalId);
  }, [selectedFrequencies, isAutoRefresh]);

  const filteredPackets = packets.filter((p) => {
    if (selectedIds.length === 0) return true;
    const match = p.message.match(/id:\s*(\d+)/i);
    const id = match ? parseInt(match[1], 10) : null;
    return id !== null && selectedIds.includes(id);
  });

  return (
    <Flex flex="1">
      {/* Sidebar */}
      <Box
        minW="240px"
        borderRight="1px solid #444"
        px={4}
        py={6}
        bg="gray.900"
      >
        {/* Back button */}
        <Box mb={6}>
          <Link to="/">
            <Button>
              <ArrowLeft style={{ marginRight: 6 }} />
              Back to Dashboard
            </Button>
          </Link>
        </Box>
        {/* Auto Refresh Toggle */}
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
                    loadPackets(newFreqs);
                  }}
                />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>

        

        
      </Box>

      {/* Main Content */}
      <Box flex="1" px={6} py={6}>
        <SensorGraphs packets={filteredPackets} />
      </Box>
    </Flex>
  );
};

export default SensorGraphsPage;
