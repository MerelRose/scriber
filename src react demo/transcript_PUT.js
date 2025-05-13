import React, { useEffect, useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Transcript_PUT = () => {
  const [transcriptData, setTranscriptData] = useState([{ tekst: '', time_stamp_start: '' }]);
  const [message, setMessage] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newTranscriptData = [...transcriptData];
    newTranscriptData[index][name] = value;
    setTranscriptData(newTranscriptData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/subtitle/1/be/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apikey,
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        tekst: transcriptData.map(item => item.tekst),
        timeStampStart: transcriptData.map(item => item.time_stamp_start),
        id: transcript.map(item => item.id)
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Netwerkfout: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        setMessage('Ondertitels succesvol bijgewerkt!');
        setTranscriptData([{ tekst: '', time_stamp_start: '' }]);
      })
      .catch(error => {
        setMessage('Error: ' + error.message);
      });
  };

  useEffect(() => {
    fetch('http://localhost:4000/transcript/1/be', {
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
      .then(data => {
        setTranscript(data);
        // Set initial values for the form fields
        const initialTranscriptData = data.map(item => ({
          tekst: item.tekst || '',
          time_stamp_start: item.time_stamp_start || ''
        }));
        setTranscriptData(initialTranscriptData);
      })
      .catch(error => {
        setError(error.message);
      });
  }, []);

  return (
    <div id="transcriptPut" className='scroll'>
      <h2>Transcript PUT</h2>
      <form onSubmit={handleSubmit}>
        {transcriptData.map((item, index) => (
          <div key={index}>
            <label>
              Tekst:
              <input
                type="text"
                name="tekst"
                value={item.tekst}
                placeholder="Voer tekst in"
                onChange={(e) => handleChange(index, e)}
                required
              />
            </label>
            <label>
              Time stamp:
              <input
                type="text"
                name="time_stamp_start"
                value={item.time_stamp_start}
                placeholder="Voer tijdstempel in"
                onChange={(e) => handleChange(index, e)}
                required
              />
            </label>
          </div>
        ))}
        <button type="submit">Send</button>
      </form>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>Fout: {error}</p>}
    </div>
  );
};

export default Transcript_PUT;
