import React from 'react';

function RiskTierBadge({ group }) {
  const groupConfig = {
    clinical: { label: 'Critical', color: '#ef4444', bg: '#fee2e2' },
    operational: { label: 'Operational', color: '#f97316', bg: '#ffedd5' },
    administrative: { label: 'Admin', color: '#22c55e', bg: '#dcfce7' },
  };

  const config = groupConfig[group] || { label: 'Unknown', color: '#6b7280', bg: '#f3f4f6' };

  return (
    <span
      className="risk-tier-badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
      }}
    >
      {config.label}
    </span>
  );
}

export default RiskTierBadge;
