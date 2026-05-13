import React, { useState, useEffect } from 'react';
import DeviceTrustCard from './DeviceTrustCard';
import SyncFeed from './SyncFeed';
import FieldDecisionTable from './FieldDecisionTable';
import PatientRecordViewer from './PatientRecordViewer';
import TrustEvolutionChart from './TrustEvolutionChart';

function Dashboard({ apiUrl }) {
  const [scenario, setScenario] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState('idle');
  const [round, setRound] = useState(0);

  const [schema, setSchema] = useState(null);
  const [patientRecord, setPatientRecord] = useState(null);
  const [trust, setTrust] = useState({});
  const [stats, setStats] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [devices, setDevices] = useState([]);

  // Fetch initial data
  useEffect(() => {
    loadSchema();
    loadTrust();
    loadRecord();
    initializeDevices();
  }, []);

  const loadSchema = async () => {
    try {
      const response = await fetch(`${apiUrl}/schema`);
      const data = await response.json();
      setSchema(data);
    } catch (err) {
      console.error('Error loading schema:', err);
    }
  };

  const loadTrust = async () => {
    try {
      const response = await fetch(`${apiUrl}/trust`);
      const data = await response.json();
      setTrust(data);
    } catch (err) {
      console.error('Error loading trust:', err);
    }
  };

  const loadRecord = async () => {
    try {
      const response = await fetch(`${apiUrl}/record/patient_001`);
      const data = await response.json();
      setPatientRecord(data);
    } catch (err) {
      console.error('Error loading record:', err);
    }
  };

  const loadAudit = async () => {
    try {
      const response = await fetch(`${apiUrl}/audit?limit=100`);
      const data = await response.json();
      setAuditLog(data.entries || []);
    } catch (err) {
      console.error('Error loading audit:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const initializeDevices = () => {
    const deviceConfigs = [
      { deviceId: 'device_nurse_A', role: 'nurse', behaviorMode: 'honest' },
      { deviceId: 'device_nurse_B', role: 'nurse', behaviorMode: 'honest' },
      { deviceId: 'device_monitor_ICU', role: 'bedside_monitor', behaviorMode: 'honest' },
      { deviceId: 'device_wearable_01', role: 'wearable_sensor', behaviorMode: 'honest' },
      { deviceId: 'device_doctor_main', role: 'doctor', behaviorMode: 'honest' },
    ];

    // Customize behavior based on scenario
    if (scenario === 'attack') {
      deviceConfigs[4] = { ...deviceConfigs[4], behaviorMode: 'malicious', deviceId: 'device_attacker' };
    } else if (scenario === 'laundering') {
      deviceConfigs[4] = { ...deviceConfigs[4], behaviorMode: 'laundering', deviceId: 'device_launderer' };
    }

    setDevices(deviceConfigs);
  };

  useEffect(() => {
    initializeDevices();
  }, [scenario]);

  const runSimulation = async () => {
    setLoading(true);
    setSimulationStatus('running');
    setRound(0);

    try {
      const response = await fetch(`${apiUrl}/simulate/${scenario}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }

      const data = await response.json();
      setRound(20);
      setStats(data.stats);
      setAuditLog(data.auditLog || []);

      // Refresh all data
      await loadTrust();
      await loadRecord();
      await loadStats();

      setSimulationStatus('complete');
    } catch (err) {
      console.error('Simulation error:', err);
      setSimulationStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${apiUrl}/reset`, { method: 'POST' });
      setAuditLog([]);
      setStats(null);
      setRound(0);
      setSimulationStatus('idle');
      loadTrust();
      loadRecord();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const latestDecisions =
    auditLog.length > 0 ? auditLog[auditLog.length - 1]?.fieldDecisions || [] : [];

  return (
    <div className="dashboard">
      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-row">
          <div className="control-group">
            <label>Scenario:</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              disabled={loading}
            >
              <option value="normal">Normal (All Honest)</option>
              <option value="attack">Direct Attack (1 Malicious)</option>
              <option value="laundering">Reputation Laundering</option>
            </select>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Running...' : 'Run Simulation'}
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>

        <div className="control-status">
          <span className="round-display">Round: {round}/20</span>
          <span
            className={`status-badge ${simulationStatus}`}
            style={{
              backgroundColor:
                simulationStatus === 'running'
                  ? '#3b82f6'
                  : simulationStatus === 'complete'
                  ? '#10b981'
                  : '#6b7280',
            }}
          >
            {simulationStatus === 'idle' && '⏸ Idle'}
            {simulationStatus === 'running' && '▶ Running'}
            {simulationStatus === 'complete' && '✓ Complete'}
            {simulationStatus === 'error' && '✗ Error'}
          </span>
        </div>
      </div>

      {/* Metrics Summary */}
      {stats && (
        <div className="metrics-summary">
          <div className="metric-card">
            <div className="metric-value">{stats.totalSyncEvents}</div>
            <div className="metric-label">Sync Events</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.totalRejectedUpdates}</div>
            <div className="metric-label">Rejected Updates</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {(stats.rejectionRate * 100).toFixed(1)}%
            </div>
            <div className="metric-label">Rejection Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.meanLatencyMs.toFixed(1)}ms</div>
            <div className="metric-label">Mean Latency</div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Device Trust Cards */}
        <div className="column left-column">
          <h2>Device Trust Scores</h2>
          <div className="device-cards-grid">
            {devices.map((device) => (
              <DeviceTrustCard
                key={device.deviceId}
                device={device}
                trustData={trust[device.deviceId]}
              />
            ))}
          </div>
        </div>

        {/* Middle Column: Sync Feed + Field Decisions */}
        <div className="column middle-column">
          <SyncFeed events={auditLog} />
          <FieldDecisionTable decisions={latestDecisions} schema={schema} />
        </div>

        {/* Right Column: Patient Record */}
        <div className="column right-column">
          <PatientRecordViewer record={patientRecord} schema={schema} />
        </div>
      </div>

      {/* Trust Evolution Chart (Full Width) */}
      <div className="chart-section">
        <TrustEvolutionChart auditLog={auditLog} />
      </div>

      {/* Comparison Table */}
      <div className="comparison-section">
        <h2>Architecture Comparison</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Architecture</th>
              <th>Malicious Rejection</th>
              <th>Legitimate Acceptance</th>
              <th>Memory/User</th>
              <th>Latency</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Document-Level LWW</td>
              <td>0%</td>
              <td>100% (blind)</td>
              <td>0 B</td>
              <td>~12 ms</td>
            </tr>
            <tr>
              <td>Uniform WMV (τ=0.6)</td>
              <td>~97%</td>
              <td>~95%</td>
              <td>52 B</td>
              <td>~45 ms</td>
            </tr>
            <tr style={{ backgroundColor: '#fef3c7' }}>
              <td><strong>Field-Granular WMV</strong></td>
              <td><strong>&gt;99% critical</strong></td>
              <td><strong>&gt;99% admin</strong></td>
              <td><strong>~180 B</strong></td>
              <td><strong>65-80 ms</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
