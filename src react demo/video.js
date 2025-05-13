import React, { useEffect, useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Video = () => {
  const [video, setVideo] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:4000/videos', {
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
      .then(data => setVideo(data))
      .catch(error => setError(error.message));
  }, []);

  return (
    <div id="video">
      <div className="scroll" style={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <h2>Video GET</h2>
        {error && <p style={{ color: 'red' }}>Fout: {error}</p>}
        {video.length > 0 ? (
          <pre>
            {video.map((taal, index) => (
              <p key={index}>{taal.naam || taal}</p>
            ))}
          </pre>
        ) : (
          !error && <p>Bezig met laden...</p>
        )}
      </div>
    </div>
  );
};

export default Video;
