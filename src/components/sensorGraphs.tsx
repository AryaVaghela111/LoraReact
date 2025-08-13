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
import { useEffect, useState } from 'react';
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
};

type SensorData = {
  temp?: number | null;
  pulse?: number | null;
  accx?: number | null;
  accy?: number | null;
  accz?: number | null;
  gyrox?: number | null;
  gyroy?: number | null;
  gyroz?: number | null;
};

const parseMessage = (message: string): SensorData => {
  if (!message) return {};

  // Try to detect if it's CSV (no labels, only numbers separated by commas)
  if (/^\s*-?\d+(\.\d+)?(,\s*-?\d+(\.\d+)?)*\s*$/.test(message)) {
    const parts = message.split(",").map(v => {
      const num = parseFloat(v.trim());
      return isNaN(num) ? null : num;
    });

    return {
      accx: parts[0] ?? null,
      accy: parts[1] ?? null,
      accz: parts[2] ?? null,
      gyrox: parts[3] ?? null,
      gyroy: parts[4] ?? null,
      gyroz: parts[5] ?? null,
      temp:  parts[6] ?? null,
      pulse: parts[7] ?? null
    };
  }

  // Fallback: original label-based parsing
  const extract = (key: string) => {
    const match = message.match(new RegExp(`${key}:\\s*([0-9.]+)`, "i"));
    return match ? parseFloat(match[1]) : null;
  };

  return {
    temp: extract("temp"),
    pulse: extract("pulse"),
    accx: extract("accx"),
    accy: extract("accy"),
    accz: extract("accz"),
    gyrox: extract("gyrox"),
    gyroy: extract("gyroy"),
    gyroz: extract("gyroz")
  };
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
  // Always take the newest 6 points
  const limitedData = [...data].sort((a, b) => a.x.getTime() - b.x.getTime()).slice(-6);

  // Find time range
  const minTime = limitedData.length ? limitedData[0].x.getTime() : Date.now();
  const maxTime = limitedData.length ? limitedData[limitedData.length - 1].x.getTime() : Date.now();
  const rangeMs = maxTime - minTime;

  // Dynamically pick unit
  let timeUnit: 'second' | 'minute' | 'hour' | 'day' = 'second';
  if (rangeMs > 1000 * 60 * 60 * 6) timeUnit = 'day';
  else if (rangeMs > 1000 * 60 * 60) timeUnit = 'hour';
  else if (rangeMs > 1000 * 60) timeUnit = 'minute';

  const chartData = {
    datasets: [
      {
        label: yAxisTitle + (unit ? ` (${unit})` : ''),
        data: limitedData,
        borderColor: color,
        backgroundColor: color.replace(')', ', 0.15)').replace('rgb', 'rgba'),
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' },
        color: '#fff'
      },
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeUnit,
          displayFormats: {
            second: 'HH:mm:ss',
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM d'
          }
        },
        ticks: { color: '#ccc' },
        title: { display: true, text: 'Time', color: '#ddd' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        title: {
          display: true,
          text: yAxisTitle + (unit ? ` (${unit})` : ''),
          color: '#ddd'
        },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: { color: '#ccc' }
      }
    }
  };

  return (
    <Box height="400px" position="relative" mb={4}>
      <Line options={options} data={chartData} />
    </Box>
  );
};


const SensorGraphs = ({ packets }: { packets: Packet[] }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Get latest 6 packets only
  const latestPackets = [...packets]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6)
    .reverse(); // oldest first for plotting

  // Build datasets
  const buildData = (key: keyof SensorData) =>
    latestPackets.map(packet => ({
      x: new Date(packet.timestamp),
      y: parseMessage(packet.message)[key] ?? null
    }));

  const tempData = buildData('temp');
  const pulseData = buildData('pulse');
  const accxData = buildData('accx');
  const accyData = buildData('accy');
  const acczData = buildData('accz');
  const gyroxData = buildData('gyrox');
  const gyroyData = buildData('gyroy');
  const gyrozData = buildData('gyroz');

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
        <SimpleGrid columns={4} gap={5} rowGap={34}>
          <Box height="300px" mb={14}>
            <SingleGraph title="Temperature" data={tempData} color="rgb(255, 99, 132)" yAxisTitle="Temperature" unit="°C" />
          </Box>
          <Box height="300px" mb={14}>
            <SingleGraph title="Acceleration X" data={accxData} color="rgb(255, 159, 64)" yAxisTitle="Accel X" unit="g" />
          </Box>
          <Box height="300px" mb={14}>
            <SingleGraph title="Acceleration Y" data={accyData} color="rgb(255, 206, 86)" yAxisTitle="Accel Y" unit="g" />
          </Box>
          <Box height="300px" mb={14}>
            <SingleGraph title="Acceleration Z" data={acczData} color="rgb(153, 102, 255)" yAxisTitle="Accel Z" unit="g" />
          </Box>
          <Box height="300px" mb={14}>
            <SingleGraph title="Pulse Rate" data={pulseData} color="rgb(54, 162, 235)" yAxisTitle="Pulse" unit="BPM" />
          </Box>
          <Box height="300px" mb={14}>
            <SingleGraph title="Gyroscope X" data={gyroxData} color="rgb(75, 192, 192)" yAxisTitle="Gyro X" unit="°/s" />
          </Box>
          <Box height="300px" mb={14}>
            <SingleGraph title="Gyroscope Y" data={gyroyData} color="rgb(255, 99, 255)" yAxisTitle="Gyro Y" unit="°/s" />
          </Box>
          <Box height="300px" mb={14}>
            <SingleGraph title="Gyroscope Z" data={gyrozData} color="rgb(54, 162, 135)" yAxisTitle="Gyro Z" unit="°/s" />
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default SensorGraphs;
