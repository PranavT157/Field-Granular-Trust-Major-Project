import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [apiUrl] = useState('http://localhost:3001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test API connection on mount
  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch(`${apiUrl}/schema`);
        if (!response.ok) {
          setError('Backend not responding. Make sure Node.js server is running on port 3001');
        }
      } catch (err) {
        setError(`Connection error: ${err.message}. Make sure backend is running on port 3001`);
      }
    }

    // Give backend a moment to start
    setTimeout(testConnection, 1000);
  }, [apiUrl]);

  return (
    <div className="app">
      <header className="app-header">
        <h1> Field-Granular Trust System</h1>
        <p>Field-Granular Trust-Aware Offline-First Synchronization System</p>
      </header>

      {error && (
        <div className="connection-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      <main className="app-main">
        <Dashboard apiUrl={apiUrl} />
      </main>
    </div>
  );
}

export default App;
