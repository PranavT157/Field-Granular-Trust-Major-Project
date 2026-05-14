import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

function TrustEvolutionChart({ auditLog }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!auditLog || auditLog.length === 0) {
      setChartData([]);
      return;
    }

    // Group by round and compute per-device trust scores
    const byRound = {};
    for (const entry of auditLog) {
      const round = entry.round || 0;
      if (!byRound[round]) {
        byRound[round] = { round };
      }

      if (entry.trustSnapshot) {
        for (const [deviceId, trustData] of Object.entries(entry.trustSnapshot)) {
          byRound[round][deviceId] = trustData.globalTrust;
        }
      }
    }

    const sorted = Object.values(byRound).sort((a, b) => a.round - b.round);
    setChartData(sorted);
  }, [auditLog]);

  if (chartData.length === 0) {
    return (
      <div className="trust-evolution-chart">
        <h3>Trust Evolution Over Time</h3>
        <p style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
          No data. Run a simulation to see trust evolution.
        </p>
      </div>
    );
  }

  // Extract device names
  const deviceIds = Object.keys(chartData[0] || {}).filter((k) => k !== 'round');

  // Color map for devices
  const colors = {
    device_nurse_A: '#8b5cf6',
    device_nurse_B: '#06b6d4',
    device_monitor_ICU: '#ec4899',
    device_wearable_01: '#f59e0b',
    device_doctor_main: '#10b981',
    device_attacker: '#ef4444',
    device_launderer: '#f59e0b',
  };

  return (
    <div className="trust-evolution-chart">
      <h3>Trust Evolution Over Time</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }} />
          <YAxis
            label={{ value: 'Trust Score', angle: -90, position: 'insideLeft' }}
            domain={[0, 1]}
          />
          <Tooltip
            formatter={(value) => (typeof value === 'number' ? value.toFixed(3) : value)}
            labelFormatter={(label) => `Round ${label}`}
          />
          <Legend />

          {/* Reference lines for thresholds */}
          <ReferenceLine y={0.9} stroke="#ddd" strokeDasharray="5 5" label="Clinical τ=0.90" />
          <ReferenceLine y={0.85} stroke="#ddd" strokeDasharray="5 5" label="Clinical τ=0.85" />
          <ReferenceLine y={0.5} stroke="#ddd" strokeDasharray="5 5" label="Admin τ=0.50" />

          {/* Device trust lines */}
          {deviceIds.map((deviceId) => (
            <Line
              key={deviceId}
              type="monotone"
              dataKey={deviceId}
              stroke={colors[deviceId] || '#666'}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrustEvolutionChart;
