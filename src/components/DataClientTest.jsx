import React, { useState, useEffect } from 'react';
import { getDataClient, resetDataClient } from '../config/dataClientConfig';

const DataClientTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);

  useEffect(() => {
    testDataClient();
  }, []);

  const testDataClient = async () => {
    try {
      setStatus('Initializing Data client...');
      
      // Force reset to ensure fresh connection
      resetDataClient();
      
      const dataClient = getDataClient();
      
      if (!dataClient) {
        throw new Error('Data client is null');
      }
      
      setStatus('Checking models...');
      
      if (!dataClient.models) {
        throw new Error('Client models are undefined');
      }
      
      const availableModels = Object.keys(dataClient.models);
      setModels(availableModels);
      setClientInfo({
        clientType: typeof dataClient,
        modelsType: typeof dataClient.models,
        modelsCount: availableModels.length,
        hasTBTRegisteredStudents: !!dataClient.models.TBTRegisteredStudents,
        hasTBTUser: !!dataClient.models.TBTUser
      });
      
      setStatus(`✅ Data client working! Found ${availableModels.length} models: ${availableModels.join(', ')}`);
      
      if (availableModels.length === 0) {
        setError('No models found. This indicates a schema deployment issue.');
        return;
      }
      
      if (!dataClient.models.TBTRegisteredStudents) {
        setError('TBTRegisteredStudents model not found in available models');
        return;
      }
      
      setStatus('Testing TBTRegisteredStudents list...');
      
      const { data } = await dataClient.models.TBTRegisteredStudents.list({
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
      
      {clientInfo && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <strong>Client Info:</strong>
          <ul className="mt-2 list-disc list-inside">
            <li>Client Type: {clientInfo.clientType}</li>
            <li>Models Type: {clientInfo.modelsType}</li>
            <li>Models Count: {clientInfo.modelsCount}</li>
            <li>Has TBTRegisteredStudents: {clientInfo.hasTBTRegisteredStudents ? '✅' : '❌'}</li>
            <li>Has TBTUser: {clientInfo.hasTBTUser ? '✅' : '❌'}</li>
          </ul>
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