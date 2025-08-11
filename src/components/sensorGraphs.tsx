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
  accx?: number | null;
  accy?: number | null;
  accz?: number | null;
  gyrox?: number | null;
  gyroy?: number | null;
  gyroz?: number | null;
};

const parseMessage = (message: string): Omit<SensorData, 'timestamp'> => {
  if (!message) return {};
  
  const result: Omit<SensorData, 'timestamp'> = {};
  
  // Extract all sensor values using regex
  const tempMatch = message.match(/temp:\s*([0-9.]+)/i);
  const pulseMatch = message.match(/pulse:\s*([0-9.]+)/i);
  const accxMatch = message.match(/accx:\s*([0-9.]+)/i);
  const accyMatch = message.match(/accy:\s*([0-9.]+)/i);
  const acczMatch = message.match(/accz:\s*([0-9.]+)/i);
  const gyroxMatch = message.match(/gyrox:\s*([0-9.]+)/i);
  const gyroyMatch = message.match(/gyroy:\s*([0-9.]+)/i);
  const gyrozMatch = message.match(/gyroz:\s*([0-9.]+)/i);

  if (tempMatch) result.temp = parseFloat(tempMatch[1]);
  if (pulseMatch) result.pulse = parseFloat(pulseMatch[1]);
  if (accxMatch) result.accx = parseFloat(accxMatch[1]);
  if (accyMatch) result.accy = parseFloat(accyMatch[1]);
  if (acczMatch) result.accz = parseFloat(acczMatch[1]);
  if (gyroxMatch) result.gyrox = parseFloat(gyroxMatch[1]);
  if (gyroyMatch) result.gyroy = parseFloat(gyroyMatch[1]);
  if (gyrozMatch) result.gyroz = parseFloat(gyrozMatch[1]);
  
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

  const MAX_POINTS = 6;
const limitedData = data.slice(-MAX_POINTS);

// Extract formatted labels
const labels = limitedData.map(d => {
  const date = new Date(d.x);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

  const chartData = {
  labels,
  datasets: [
    {
      label: yAxisTitle + (unit ? ` (${unit})` : ''),
      data: limitedData.map(d => d.y),
      borderColor: color,
      backgroundColor: color.replace(')', ', 0.15)').replace('rgb', 'rgba'),
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: color,
      tension: 0.3,
      fill: true
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
      type: 'category', // Makes points equidistant
      title: {
        display: true,
        text: 'Time',
        color: '#ddd'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.08)'
      },
      ticks: {
        color: '#ccc'
      }
    },
    y: {
      title: {
        display: true,
        text: yAxisTitle + (unit ? ` (${unit})` : ''),
        color: '#ddd'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.08)'
      },
      ticks: {
        color: '#ccc'
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
  
  // Prepare data for all 8 sensors
  const tempData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).temp ?? null
  }));

  const pulseData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).pulse ?? null
  }));

  const accxData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).accx ?? null
  }));

  const accyData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).accy ?? null
  }));

  const acczData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).accz ?? null
  }));

  const gyroxData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).gyrox ?? null
  }));

  const gyroyData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).gyroy ?? null
  }));

  const gyrozData = last20Packets.map(packet => ({
    x: new Date(packet.timestamp),
    y: parseMessage(packet.message).gyroz ?? null
  }));

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
        <SimpleGrid columns={3} gap={5} rowGap={34}>
          {/* Row 1 */}
          <Box height="300px" mb={9}>
            <SingleGraph 
              title="Temperature" 
              data={tempData} 
              color="rgb(255, 99, 132)" 
              yAxisTitle="Temperature" 
              unit="°C"
            />
          </Box>
          <Box height="300px" mb={9}>
            <SingleGraph 
              title="Pulse Rate" 
              data={pulseData} 
              color="rgb(54, 162, 235)" 
              yAxisTitle="Pulse" 
              unit="BPM"
            />
          </Box>
          <Box height="300px" mb={9}>
            <SingleGraph 
              title="Acceleration X" 
              data={accxData} 
              color="rgb(255, 159, 64)" 
              yAxisTitle="Accel X" 
              unit="g"
            />
          </Box>

          {/* Row 2 */}
          <Box height="300px" mb={9}>
            <SingleGraph 
              title="Acceleration Y" 
              data={accyData} 
              color="rgb(255, 206, 86)" 
              yAxisTitle="Accel Y" 
              unit="g"
            />
          </Box>
          <Box height="300px" mb={9}>
            <SingleGraph 
              title="Acceleration Z" 
              data={acczData} 
              color="rgb(153, 102, 255)" 
              yAxisTitle="Accel Z" 
              unit="g"
            />
          </Box>
          <Box height="300px" mb={9}>
            <SingleGraph 
              title="Gyroscope X" 
              data={gyroxData} 
              color="rgb(75, 192, 192)" 
              yAxisTitle="Gyro X" 
              unit="°/s"
            />
          </Box>

          {/* Row 3 */}
          <Box height="300px" mb={12}>
            <SingleGraph 
              title="Gyroscope Y" 
              data={gyroyData} 
              color="rgb(255, 99, 255)" 
              yAxisTitle="Gyro Y" 
              unit="°/s"
            />
          </Box>
          <Box height="300px" mb={12}>
            <SingleGraph 
              title="Gyroscope Z" 
              data={gyrozData} 
              color="rgb(54, 162, 135)" 
              yAxisTitle="Gyro Z" 
              unit="°/s"
            />
          </Box>
          <Box height="300px" mb={12}>
            {/* Empty box for 3x3 grid */}
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default SensorGraphs;
