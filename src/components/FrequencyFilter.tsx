import {
  Checkbox,
  VStack,
  Text,
  Box
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export interface FrequencyFilterProps {
  packets: { frequency: number }[];
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
    const freqs = Array.from(new Set(packets.map((pkt) => pkt.frequency)));
    setUniqueFrequencies(freqs);
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
      <VStack align="start">
        {uniqueFrequencies.map((freq) => (
          <Checkbox.Root
            key={freq}
            checked={selectedFrequencies.includes(freq)}
            onCheckedChange={() => handleToggle(freq)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>{freq} MHz</Checkbox.Label>
          </Checkbox.Root>
        ))}
      </VStack>
    </Box>
  );
};

export default FrequencyFilter;
