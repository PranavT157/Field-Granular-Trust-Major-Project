import React from 'react';

function SyncFeed({ events }) {
  return (
    <div className="sync-feed">
      <h3>Live Sync Events</h3>
      <div className="feed-list">
        {events.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            No sync events yet. Run a simulation to see events.
          </p>
        ) : (
          events.slice(-20).reverse().map((event, idx) => {
            const acceptedCount = (event.fieldDecisions || []).filter((d) => d.accepted).length;
            const rejectedCount = (event.fieldDecisions || []).filter((d) => !d.accepted).length;

            return (
              <div key={idx} className="feed-item">
                <div className="feed-timestamp">
                  Round {event.round} • {new Date(event.timestamp).toLocaleTimeString()}
                </div>

                <div className="feed-fields">
                  {(event.fieldDecisions || []).map((decision, i) => (
                    <span
                      key={i}
                      className="feed-field-badge"
                      title={`${decision.fieldPath}: ${decision.accepted ? 'ACCEPTED' : 'REJECTED'}`}
                      style={{
                        backgroundColor: decision.accepted ? '#dcfce7' : '#fee2e2',
                        color: decision.accepted ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {decision.fieldPath.substring(0, 8)}...{decision.accepted ? '✓' : '✗'}
                    </span>
                  ))}
                </div>

                <div className="feed-summary">
                  {acceptedCount > 0 && (
                    <span style={{ color: '#22c55e' }}>
                      {acceptedCount} accepted
                    </span>
                  )}
                  {rejectedCount > 0 && (
                    <span style={{ color: '#ef4444', marginLeft: acceptedCount > 0 ? '12px' : 0 }}>
                      {rejectedCount} rejected
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SyncFeed;
