import React, { useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Transcript_Post = () => {
  const [transcriptData, setTranscriptData] = useState({ naam: '', file_name: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTranscriptData({ ...transcriptData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/transcript-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apikey,
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(transcriptData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Netwerkfout: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        setMessage('Taal successfully added!');
        setTranscriptData({ naam: '', file_name: '' }); 
      })
      .catch(error => {
        setMessage('Error: ' + error.message);
      });
  };

  return (
    <div id="taalPost" className='scroll'>
      <h2>Transcript POST</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Tekst:
            <input
              type="text"
              name="tekst"
              value={transcriptData.tekst}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            video_id:
            <input
              type="text"
              name="video_id"
              value={transcriptData.video_id}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Time stamp:
            <input
              type="text"
              name="time_stamp_start"
              value={transcriptData.time_stamp_start}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            taal:
            <input
              type="text"
              name="taal"
              value={transcriptData.taal}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <button type="submit">Send</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Transcript_Post;
