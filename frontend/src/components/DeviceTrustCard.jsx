import React from 'react';

function DeviceTrustCard({ device, trustData }) {
  const { globalTrust, alpha_global, beta_global } = trustData || {
    globalTrust: 0.5,
    alpha_global: 0,
    beta_global: 0,
  };

  const trustColor = globalTrust > 0.8 ? '#22c55e' : globalTrust > 0.5 ? '#f97316' : '#ef4444';
  const trustPercentage = (globalTrust * 100).toFixed(1);

  const roleEmoji = {
    nurse: '👩‍⚕️',
    doctor: '👨‍⚕️',
    intern: '👨‍🎓',
    wearable_sensor: '⌚',
    bedside_monitor: '🖥️',
  };

  const emoji = roleEmoji[device.role] || '🔧';

  return (
    <div className="device-trust-card" style={{ borderLeft: `4px solid ${trustColor}` }}>
      <div className="card-header">
        <span className="device-emoji">{emoji}</span>
        <div>
          <h3 style={{ margin: '0 0 4px 0' }}>{device.deviceId}</h3>
          <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{device.role}</p>
        </div>
      </div>

      <div className="trust-bar">
        <div
          className="trust-fill"
          style={{
            width: `${trustPercentage}%`,
            backgroundColor: trustColor,
            height: '24px',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
          }}
        />
        <span className="trust-label">{trustPercentage}%</span>
      </div>

      <div className="trust-counters">
        <div className="counter-item">
          <span className="counter-label">Honest:</span>
          <span className="counter-value" style={{ color: '#22c55e' }}>
            {alpha_global}
          </span>
        </div>
        <div className="counter-item">
          <span className="counter-label">Malicious:</span>
          <span className="counter-value" style={{ color: '#ef4444' }}>
            {beta_global}
          </span>
        </div>
      </div>

      <div className="behavior-badge">
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            backgroundColor:
              device.behaviorMode === 'malicious'
                ? '#fee2e2'
                : device.behaviorMode === 'laundering'
                ? '#fef3c7'
                : '#dcfce7',
            color:
              device.behaviorMode === 'malicious'
                ? '#dc2626'
                : device.behaviorMode === 'laundering'
                ? '#d97706'
                : '#16a34a',
          }}
        >
          {device.behaviorMode === 'honest' && '✓ Honest'}
          {device.behaviorMode === 'malicious' && '✗ Malicious'}
          {device.behaviorMode === 'laundering' && '⚠ Laundering'}
        </span>
      </div>
    </div>
  );
}

export default DeviceTrustCard;
