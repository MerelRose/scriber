import React, { useEffect, useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Transcript_change = () => {
  const [transcript_change, setTranscript_change] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:4000/transcript/1/nl', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apikey,
        'Authorization': `Bearer ${jwtToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Netwerkfout: ' + response.status);
        }
        return response.json();
      })
      .then(data => setTranscript_change(data))
      .catch(error => setError(error.message));
  }, []);

  return (
    <div id="transcript_change">
      <div className="scroll" style={{ maxHeight: '300px', overflowY: 'scroll' }}>
      <h2>Transcript:id GET</h2>
        {error && <p style={{ color: 'red' }}>Fout: {error}</p>}
        {transcript_change.length > 0 ? (
          <pre>
            {transcript_change.map((transcript, index) => (
              <p key={index}>{transcript.tekst || transcript}</p>
            ))}
          </pre>
        ) : (
          !error && <p>Bezig met laden...</p>
        )}
      </div>
    </div>
  );
};

export default Transcript_change;
