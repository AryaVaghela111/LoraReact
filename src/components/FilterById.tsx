import {
  Checkbox,
  VStack,
  Text,
  Box,
  StackSeparator
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";

export interface IdFilterProps {
  packets: { message: string }[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

const FilterById = ({ packets, selectedIds, onChange }: IdFilterProps) => {
  const [uniqueIds, setUniqueIds] = useState<number[]>([]);

  useEffect(() => {
    if (Array.isArray(packets)) {
      const ids = packets
        .map((pkt) => {
          const match = pkt.message.match(/id:\s*(\d+)/i);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((id): id is number => id !== null);

      setUniqueIds(Array.from(new Set(ids)).sort((a, b) => a - b));
    } else {
      setUniqueIds([]);
    }
  }, [packets]);

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <Box p={4} borderRight="1px solid #ccc" minW="200px">
      <Text fontSize="lg" mb={2} fontWeight="bold">
        Filter by Device ID
      </Text>
      <VStack align="start" separator={<StackSeparator />}>
        {uniqueIds.map((id) => (
          <Checkbox.Root
            key={id}
            checked={selectedIds.includes(id)}
            onCheckedChange={() => handleToggle(id)}
            id={`device-${id}`}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control boxSize="5" border="2px solid #ccc">
              <Checkbox.Indicator>
                <FaCheckSquare color="white" />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label>Device {id}</Checkbox.Label>
          </Checkbox.Root>
        ))}
      </VStack>
    </Box>
  );
};

export default FilterById;
