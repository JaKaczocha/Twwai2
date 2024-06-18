import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { io, Socket } from 'socket.io-client';
import './dashboardButtons.css';

import { jwtDecode } from 'jwt-decode';

interface IData {
  temperature: number;
  pressure: number;
  humidity: number;
  deviceId: number;
  readingDate?: Date;
}

const DashboardActivity: React.FC = () => {
  const [latestReadings, setLatestReadings] = useState<IData[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number>(() => {
    const storedDeviceId = localStorage.getItem('selectedDeviceId');
    return storedDeviceId ? parseInt(storedDeviceId) : 1;
  });
  const [tokenValid, setTokenValid] = useState(true); // State to track token validity
  const chartRef = useRef<Chart | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setTokenValid(false); // Token not found or invalid
          return;
        }

        // Decode token to get userId
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.userId;

        // Fetch data using userId and selectedDeviceId
        const response = await fetch(`http://localhost:3100/api/data/${selectedDeviceId}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setLatestReadings(data);
          setTokenValid(true); // Token is valid
        } else {
          console.error('Failed to fetch latest readings:', response.statusText);
          setTokenValid(false); // Failed to fetch data due to token or server error
        }
      } catch (error) {
        console.error('Error fetching latest readings:', error);
        setTokenValid(false); // Error occurred during fetch
      }
    };

    fetchData();
  }, [selectedDeviceId]);

  useEffect(() => {
    const socket = io('http://localhost:3100');
    socketRef.current = socket;

    socket.on('dataUpdate', (data: IData) => {
      console.log('Received data update from socket:', data);
      setLatestReadings((prevData) => [...prevData, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (latestReadings.length > 0) {
      renderChart();
    }
  }, [latestReadings]);

  const handleDeviceChange = (deviceId: number) => {
    setSelectedDeviceId(deviceId - 1); // Adjust deviceId here based on your application logic
    localStorage.setItem('selectedDeviceId', String(deviceId - 1));
  };

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

  useEffect(() => {
    if (chartRef.current) {
      renderChart();
    }
  }, [latestReadings]);

  if (!tokenValid) {
    return (
      <div className="dashboard-activity-container">
        <div className="dashboard-activity">
          <p>Unauthorized or token expired. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-activity-container">
      <div className="dashboard-activity">
        <div className="chart-container">
          <canvas id="myChart"></canvas>
        </div>
        <div
          className="device-list"
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}
        >
          <div className="btn-group" role="group">
            {[...Array(20).keys()].map((num) => (
              <button
                key={num + 1}
                type="button"
                className={`btn btn-secondary ${selectedDeviceId === num ? 'active' : ''}`}
                onClick={() => handleDeviceChange(num + 1)}
              >
                {num + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardActivity;