import { Box, Text } from "@chakra-ui/react";

type PacketCardProps = {
  data: string;
  time: string;
};

const PacketCard = ({ data, time }: PacketCardProps) => (
  <Box borderWidth="1px" borderRadius="lg" p={4} mb={2} shadow="md">
    <Text fontWeight="bold">Time: {time}</Text>
    <Text>Data: {data}</Text>
  </Box>
);

export default PacketCard;
