import {
  Box,
  Spinner,
  Text,
  Table,
} from '@chakra-ui/react';

type Packet = {
  id: number;
  timestamp: string;
  message: string;
  frequency: number;
};

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const timePart = date.toLocaleTimeString(undefined, options);
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const month = date.toLocaleString(undefined, { month: 'long' });

  return `${timePart} ${day}${suffix} ${month}`;
};

const PacketTable = ({ packets, loading }: { packets: Packet[]; loading: boolean }) => {
  return (
    <Box flex="1">
      <Text fontSize="2xl" mb="4" fontWeight="bold">
        📡 LoRaWAN Packet Log
      </Text>

      {loading ? (
        <Spinner size="lg" />
      ) : (
        <Table.Root variant="line" size="md">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>Timestamp</Table.ColumnHeader>
              <Table.ColumnHeader>Message</Table.ColumnHeader>
              <Table.ColumnHeader>Frequency (MHz)</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {packets.map((pkt) => (
              <Table.Row key={pkt.id}>
                <Table.Cell>{pkt.id}</Table.Cell>
                <Table.Cell>{formatTimestamp(pkt.timestamp)}</Table.Cell>
                <Table.Cell>{pkt.message}</Table.Cell>
                <Table.Cell>{pkt.frequency}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
};

export default PacketTable;
