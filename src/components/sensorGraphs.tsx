import { Box, Text, Spinner, Flex } from '@chakra-ui/react';
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
import React from 'react';

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

const SensorGraphs = ({ packets }: { packets: Packet[] }) => {
  const chartRef = useRef<ChartJS<'line', { x: Date; y: number | null }[], unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Process the last 20 packets
  const last20Packets = [...packets]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
  console.log(last20Packets);
  
  // Prepare chart data
  const chartData = {
    datasets: [
      {
        label: 'Temperature (°C)',
        data: last20Packets.map(packet => ({
          x: new Date(packet.timestamp),
          y: parseMessage(packet.message).temp ?? null
        })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Pulse (BPM)',
        data: last20Packets.map(packet => ({
          x: new Date(packet.timestamp),
          y: parseMessage(packet.message).pulse ?? null
        })),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
      {
        label: 'Accelerometer',
        data: last20Packets.map(packet => ({
          x: new Date(packet.timestamp),
          y: parseMessage(packet.message).acc ?? null
        })),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        yAxisID: 'y2',
      },
      {
        label: 'Gyroscope',
        data: last20Packets.map(packet => ({
          x: new Date(packet.timestamp),
          y: parseMessage(packet.message).gyro ?? null
        })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y3',
      }
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Sensor Data (Last 20 Readings)',
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString();
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
          text: 'Temperature (°C)'
        }
      },
      y1: {
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Pulse (BPM)'
        }
      },
      y2: {
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Accelerometer'
        }
      },
      y3: {
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Gyroscope'
        }
      }
    }
  };

  // Handle chart instance cleanup
  useEffect(() => {
    const currentChart = chartRef.current;
    return () => {
      if (currentChart) {
        currentChart.destroy();
      }
    };
  }, []);

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
        <Box height="400px" position="relative">
          <Line
            ref={chartRef}
            options={options}
            data={chartData}
            key={last20Packets.length} // Force re-render when data changes
          />
        </Box>
      )}
    </Box>
  );
};

export default SensorGraphs;