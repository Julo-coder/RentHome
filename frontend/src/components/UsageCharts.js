import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const UsageCharts = ({ usageData }) => {
    const [selectedUtility, setSelectedUtility] = useState('all');

    // Add data validation
    if (!usageData || !Array.isArray(usageData) || usageData.length === 0) {
        return <div>No usage history available</div>;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Utility Usage Over Time',
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const datasets = [];
    
    if (selectedUtility === 'all' || selectedUtility === 'water') {
        datasets.push({
            label: 'Water Usage (m³)',
            data: usageData.map(d => parseFloat(d.water_usage) || 0),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.1
        });
    }
    
    if (selectedUtility === 'all' || selectedUtility === 'electricity') {
        datasets.push({
            label: 'Electricity Usage (kWh)',
            data: usageData.map(d => parseFloat(d.electricity_usage) || 0),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            tension: 0.1
        });
    }
    
    if (selectedUtility === 'all' || selectedUtility === 'gas') {
        datasets.push({
            label: 'Gas Usage (m³)',
            data: usageData.map(d => parseFloat(d.gas_usage) || 0),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1
        });
    }

    const data = {
        labels: usageData.map(d => formatDate(d.date_of_measure)),
        datasets
    };

    return (
        <div className="usage-charts">
            <div className="chart-controls">
                <select 
                    value={selectedUtility} 
                    onChange={(e) => setSelectedUtility(e.target.value)}
                    className="chart-select"
                >
                    <option value="all">All Utilities</option>
                    <option value="water">Water</option>
                    <option value="electricity">Electricity</option>
                    <option value="gas">Gas</option>
                </select>
            </div>
            <div className="chart-container" style={{ height: '400px' }}>
                <Line options={options} data={data} />
            </div>
        </div>
    );
};

export default UsageCharts;