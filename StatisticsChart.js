// components/StatisticsChart.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchStatistics } from './services/adminService';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatisticsChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const loadStatistics = async () => {
      const data = await fetchStatistics();
      setChartData({
        labels: ['Users', 'Rentals', 'Completed Rentals'],
        datasets: [
          {
            label: 'Counts',
            data: [data.userCount, data.rentalCount, data.completedRentals],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
          },
        ],
      });
    };

    loadStatistics();
  }, []);

  return (
    <div>
      <h2>Platform Statistics</h2>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Statistics Overview' },
            },
          }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default StatisticsChart;
