import {
  Checkbox,
  VStack,
  Text,
  Box,
  StackSeparator
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";


export interface FrequencyFilterProps {
  packets: { frequency: number }[];  // stays the same
  selectedFrequencies: number[];
  onChange: (frequencies: number[]) => void;
}

const FrequencyFilter = ({
  packets,
  selectedFrequencies,
  onChange,
}: FrequencyFilterProps) => {
  const [uniqueFrequencies, setUniqueFrequencies] = useState<number[]>([]);

  useEffect(() => {
  if (Array.isArray(packets)) {
    const validFreqs = packets
      .map((pkt) => {
        const freq = parseFloat(pkt.frequency as any);
        return isNaN(freq) ? null : freq;
      })
      .filter((f): f is number => f !== null);

    const uniqueFreqs = Array.from(new Set(validFreqs));
    setUniqueFrequencies(uniqueFreqs);
  } else {
    console.warn('🔍 packets is not an array:', packets);
    setUniqueFrequencies([]);
  }
}, [packets]);

  const handleToggle = (freq: number) => {
    if (selectedFrequencies.includes(freq)) {
      onChange(selectedFrequencies.filter((f) => f !== freq));
    } else {
      onChange([...selectedFrequencies, freq]);
    }
  };

  return (
    <Box p={4} borderRight="1px solid #ccc" minW="200px">
      <Text fontSize="lg" mb={2} fontWeight="bold">
        Filter by Frequency
      </Text>
      <VStack align="start" separator={<StackSeparator />}>
        {uniqueFrequencies.map((freq) => (
          <Checkbox.Root
            key={freq}
            checked={selectedFrequencies.includes(freq)}
            onCheckedChange={() => handleToggle(freq)}
            id={`freq-${freq}`}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control boxSize="5" border="2px solid #ccc">
              <Checkbox.Indicator>
                <FaCheckSquare color="white" />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label>{freq} MHz</Checkbox.Label>
          </Checkbox.Root>
        ))}
      </VStack>
    </Box>
  );
};

export default FrequencyFilter;
