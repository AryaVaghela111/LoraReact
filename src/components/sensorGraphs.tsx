import { Box, Text, Spinner, Flex, SimpleGrid } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type ChartOptions
} from 'chart.js';
import { enUS } from 'date-fns/locale';
import { useRef, useEffect, useState } from 'react';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

type Packet = {
  _id: string;
  timestamp: string;
  message: string;
  frequency: number;
  __v?: number;
};

type SensorData = {
  timestamp: Date;
  temp?: number | null;
  pulse?: number | null;
  acc?: number | null;
  gyro?: number | null;
};

const parseMessage = (message: string): Omit<SensorData, 'timestamp'> => {
  if (!message) return {};
  
  const result: Omit<SensorData, 'timestamp'> = {};
  
  // Extract values using regex
  const tempMatch = message.match(/temp:\s*([0-9.]+)/i);
  const pulseMatch = message.match(/pulse:\s*([0-9.]+)/i);
  const accMatch = message.match(/acc:\s*([0-9.]+)/i);
  const gyroMatch = message.match(/gyro:\s*([0-9.]+)/i);

  if (tempMatch) result.temp = parseFloat(tempMatch[1]);
  if (pulseMatch) result.pulse = parseFloat(pulseMatch[1]);
  if (accMatch) result.acc = parseFloat(accMatch[1]);
  if (gyroMatch) result.gyro = parseFloat(gyroMatch[1]);
  
  return result;
};

const SingleGraph = ({ 
  title, 
  data, 
  color,
  yAxisTitle,
  unit
}: {
  title: string;
  data: { x: Date; y: number | null }[];
  color: string;
  yAxisTitle: string;
  unit?: string;
}) => {
  const chartRef = useRef<ChartJS<'line', { x: Date; y: number | null }[], unknown> | null>(null);

  const chartData = {
    datasets: [
      {
        label: yAxisTitle + (unit ? ` (${unit})` : ''),
        data: data,
        borderColor: color,
        backgroundColor: color.replace(')', ', 0.5)').replace('rgb', 'rgba'),
      }
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString();
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          tooltipFormat: 'PPpp',
          displayFormats: {
            minute: 'HH:mm',
            hour: 'MMM d, HH:mm'
          }
        },
        adapters: {
          date: {
            locale: enUS,
          },
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: yAxisTitle + (unit ? ` (${unit})` : '')
        }
      }
    }
  };

  useEffect(() => {
    const currentChart = chartRef.current;
    return () => {
      if (currentChart) {
        currentChart.destroy();
      }
    };
  }, []);

  return (
    <Box height="400px" position="relative" mb={4}>
      <Line
        ref={chartRef}
        options={options}
        data={chartData}
      />
    </Box>
  );
};

const SensorGraphs = ({ packets }: { packets: Packet[] }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Process the last 20 packets
  const last20Packets = [...packets]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
  
  // Prepare data for each sensor (keep this the same)
  const tempData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).temp ?? null
  }));

  const pulseData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).pulse ?? null
  }));

  const accData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).acc ?? null
  }));

  const gyroData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).gyro ?? null
  }));

  // Set loading state
  useEffect(() => {
    if (packets.length > 0) {
      setIsLoading(false);
    }
  }, [packets]);

  return (
    <Box mt={8} p={4} borderWidth="1px" borderRadius="lg">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Sensor Data Visualization
      </Text>
      
      {isLoading ? (
        <Flex justify="center" align="center" height="400px">
          <Spinner size="lg" />
        </Flex>
      ) : (
        <SimpleGrid columns={2} >
          <Box height="400px">
            <SingleGraph 
              title="Temperature" 
              data={tempData} 
              color="rgb(255, 99, 132)" 
              yAxisTitle="Temperature" 
              unit="°C"
            />
          </Box>
          <Box height="400px">
            <SingleGraph 
              title="Pulse" 
              data={pulseData} 
              color="rgb(54, 162, 235)" 
              yAxisTitle="Pulse" 
              unit="BPM"
            />
          </Box>
          <Box height="400px">
            <SingleGraph 
              title="Accelerometer" 
              data={accData} 
              color="rgb(255, 206, 86)" 
              yAxisTitle="Accelerometer"
            />
          </Box>
          <Box height="400px">
            <SingleGraph 
              title="Gyroscope" 
              data={gyroData} 
              color="rgb(75, 192, 192)" 
              yAxisTitle="Gyroscope"
            />
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default SensorGraphs;