import React from 'react';
import RiskTierBadge from './RiskTierBadge';

function FieldDecisionTable({ decisions, schema }) {
  if (!decisions || decisions.length === 0) {
    return (
      <div className="field-decision-table">
        <h3>Field-Level Decisions</h3>
        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
          No decisions to display. Run a simulation.
        </p>
      </div>
    );
  }

  const schemaProps = schema?.properties || {};

  return (
    <div className="field-decision-table">
      <h3>Field-Level Decisions (Recent Round)</h3>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Tier</th>
            <th>Decision</th>
            <th>Weight / τ</th>
            <th>Winning Value</th>
          </tr>
        </thead>
        <tbody>
          {decisions.map((decision, idx) => {
            const schemaField = schemaProps[decision.fieldPath] || {};
            const group = schemaField['x-trust-group'] || 'administrative';

            return (
              <tr
                key={idx}
                style={{
                  backgroundColor: decision.accepted ? '#f0fdf4' : '#fef2f2',
                }}
              >
                <td className="field-name">
                  <code>{decision.fieldPath}</code>
                </td>
                <td>
                  <RiskTierBadge group={group} />
                </td>
                <td>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      backgroundColor: decision.accepted ? '#dcfce7' : '#fee2e2',
                      color: decision.accepted ? '#16a34a' : '#dc2626',
                      fontSize: '12px',
                    }}
                  >
                    {decision.accepted ? '✓ ACCEPT' : '✗ REJECT'}
                  </span>
                </td>
                <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  {decision.totalWeight.toFixed(2)} / {decision.tau.toFixed(2)}
                </td>
                <td style={{ fontSize: '12px', fontFamily: 'monospace', maxWidth: '120px' }}>
                  {typeof decision.winningValue === 'object'
                    ? JSON.stringify(decision.winningValue).substring(0, 30)
                    : String(decision.winningValue).substring(0, 30)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FieldDecisionTable;
