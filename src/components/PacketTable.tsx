import {
  Box,
  Text,
  Input,
  InputGroup,
  Button,
  HStack,
  Table,
} from '@chakra-ui/react';
import { CiSearch } from 'react-icons/ci';

type Packet = {
  _id: string;
  timestamp: string;
  message: string;
  frequency: number;
};

type PacketTableProps = {
  packets: Packet[];
  page: number;
  pages: number;
  search: string;
  setSearch: (value: string) => void;
  onSearch: (value: string) => void;
  onPageChange: (page: number) => void;
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
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th';
  const month = date.toLocaleString(undefined, { month: 'long' });

  return `${timePart} ${day}${suffix} ${month}`;
};

const PacketTable = ({
  packets,
  page,
  pages,
  search,
  setSearch,
  onSearch,
  onPageChange,
}: PacketTableProps) => {

  return (
    <Box flex="1">
      <Text fontSize="2xl" mb="4" fontWeight="bold">
        📡 LoRaWAN Packet Log
      </Text>

      <InputGroup startElement={<CiSearch color="gray.400" />} mb="4" maxW="400px">
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSearch(e.currentTarget.value);
      }}
      placeholder="Search message or timestamp"
    />
  </InputGroup>
  

      
        <>
          <Table.Root variant="outline" size="md">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>#</Table.ColumnHeader>
                <Table.ColumnHeader>Timestamp</Table.ColumnHeader>
                <Table.ColumnHeader>Message</Table.ColumnHeader>
                <Table.ColumnHeader>Frequency (MHz)</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <tbody>
              {packets.map((pkt, index) => (
                <Table.Row key={pkt._id}>
                  <Table.Cell>{(page - 1) * 25 + index + 1}</Table.Cell>
                  <Table.Cell>{formatTimestamp(pkt.timestamp)}</Table.Cell>
                  <Table.Cell>{pkt.message}</Table.Cell>
                  <Table.Cell>{pkt.frequency}</Table.Cell>
                </Table.Row>
              ))}
            </tbody>
          </Table.Root>

          <HStack mt="4">
            <Button onClick={() => onPageChange(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <Text>
              Page {page} of {pages}
            </Text>
            <Button onClick={() => onPageChange(page + 1)} disabled={page === pages}>
              Next
            </Button>
          </HStack>
        </>
    </Box>
  );
};

export default PacketTable;
