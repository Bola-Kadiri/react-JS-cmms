// src/components/DebugJWT.tsx
import React from 'react';
import { tokenManager } from '../services/apiClient';
import { inspectJWTPayload } from '../utils/inspectToken';

const DebugJWT: React.FC = () => {
  const [tokenData, setTokenData] = React.useState<any>(null);
  
  const inspectCurrentToken = () => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    
    console.log('=== TOKEN INSPECTION ===');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    
    if (accessToken) {
      const payload = inspectJWTPayload(accessToken);
      setTokenData(payload);
    }
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>JWT Token Inspector</h3>
      <button onClick={inspectCurrentToken}>
        Inspect Current Token
      </button>
      
      {tokenData && (
        <div style={{ marginTop: '20px' }}>
          <h4>Token Payload:</h4>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(tokenData, null, 2)}
          </pre>
          
          <h4>Available Fields:</h4>
          <ul>
            {Object.keys(tokenData).map(key => (
              <li key={key}>
                <strong>{key}:</strong> {typeof tokenData[key]} - {String(tokenData[key])}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DebugJWT;