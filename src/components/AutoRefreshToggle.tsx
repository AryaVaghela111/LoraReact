import { Button, Box, Text } from '@chakra-ui/react';
import { useAutoRefresh } from './AutoRefreshContext';

const AutoRefreshToggle = () => {
  const { isAutoRefresh, toggleAutoRefresh } = useAutoRefresh();

  return (
    <Box mt={4}>
      <Text mb={2} fontWeight="bold">Auto Refresh</Text>
      <Button
        colorScheme={isAutoRefresh ? 'red' : 'green'}
        size="sm"
        onClick={toggleAutoRefresh}
      >
        {isAutoRefresh ? 'Stop' : 'Start'}
      </Button>
    </Box>
  );
};

export default AutoRefreshToggle;
