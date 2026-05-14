import React from 'react';
import RiskTierBadge from './RiskTierBadge';

function PatientRecordViewer({ record, schema }) {
  if (!record) {
    return (
      <div className="patient-record-viewer">
        <h3>Patient Record</h3>
        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
          No patient record loaded
        </p>
      </div>
    );
  }

  const schemaProps = schema?.properties || {};
  const displayFields = Object.keys(record)
    .filter((k) => !k.startsWith('_'))
    .sort();

  return (
    <div className="patient-record-viewer">
      <h3>Patient Golden Record</h3>
      <div className="record-fields">
        {displayFields.map((field) => {
          const schemaField = schemaProps[field] || {};
          const group = schemaField['x-trust-group'] || 'administrative';
          const value = record[field];

          return (
            <div key={field} className="record-field">
              <div className="field-label-row">
                <label>{field}</label>
                <RiskTierBadge group={group} />
              </div>
              <div className="field-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="record-metadata">
        <p style={{ fontSize: '11px', color: '#999', margin: '12px 0 0 0' }}>
          Document ID: <code>{record._id}</code>
        </p>
        <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>
          Revision: <code>{record._rev}</code>
        </p>
      </div>
    </div>
  );
}

export default PatientRecordViewer;
