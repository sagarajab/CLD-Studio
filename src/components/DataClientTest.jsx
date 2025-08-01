import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';

const DataClientTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);

  useEffect(() => {
    testDataClient();
  }, []);

  const testDataClient = async () => {
    try {
      setStatus('Initializing Data client...');
      
      const client = generateClient();
      
      if (!client) {
        throw new Error('Data client is null');
      }
      
      setStatus('Checking models...');
      
      if (!client.models) {
        throw new Error('Client models are undefined');
      }
      
      const availableModels = Object.keys(client.models);
      setModels(availableModels);
      
      setStatus('Testing TBTRegisteredStudents list...');
      
      const { data } = await client.models.TBTRegisteredStudents.list({
        limit: 10
      });
      
      setStatus(`✅ Data client working! Found ${data.length} registered students. Available models: ${availableModels.join(', ')}`);
      
    } catch (err) {
      setError(err.message);
      setStatus('❌ Data client test failed');
      console.error('Data client test error:', err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Data Client Test</h3>
      
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {models.length > 0 && (
        <div className="mb-4">
          <strong>Available Models:</strong>
          <ul className="list-disc list-inside mt-2">
            {models.map(model => (
              <li key={model}>{model}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        onClick={testDataClient}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Again
      </button>
    </div>
  );
};

export default DataClientTest; 