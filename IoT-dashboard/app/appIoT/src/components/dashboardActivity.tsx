import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

 interface IData {
  temperature: number;
  pressure: number;
  humidity: number;
  deviceId: number;
  readingDate?: Date;
}

const DashboardActivity: React.FC = () => {
  const [latestReadings, setLatestReadings] = useState<IData[]>([]); // Użycie typu IData
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchLatestReadings = async () => {
      try {
        const response = await fetch('http://localhost:3100/api/data/1/30');
        if (response.ok) {
          const data = await response.json();
          setLatestReadings(data);
        } else {
          console.error('Failed to fetch latest readings:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching latest readings:', error);
      }
    };

    fetchLatestReadings();
  }, []);

  useEffect(() => {
    if (latestReadings.length > 0) {
      renderChart();
    }
  }, [latestReadings]);

  const renderChart = () => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (!ctx) return;

    const readingDates = latestReadings.map((reading) => new Date(reading.readingDate!).toLocaleString());
    const temperatures = latestReadings.map((reading) => reading.temperature);
    const pressures = latestReadings.map((reading) => reading.pressure);
    const humidities = latestReadings.map((reading) => reading.humidity);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: readingDates,
        datasets: [
          {
            label: 'Temperature',
            data: temperatures,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.3,
          },
          {
            label: 'Pressure',
            data: pressures,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.3,
          },
          {
            label: 'Humidity',
            data: humidities,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Reading Date',
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value',
            },
          },
        },
      },
    });
  };

  return (
    <div className="dashboard-activity">
      <h2>Dashboard Activity</h2>
      <p>This is where your dashboard content goes.</p>
      <div className="chart-container">
        <canvas id="myChart"></canvas>
      </div>
    </div>
  );
};

export default DashboardActivity;