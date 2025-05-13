import React, { useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Transcript_Taal_DEL = () => {
  const [transcriptData, setTranscriptData] = useState({ naam: '', file_name: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/subtitle/1/be/del', {
      method: 'DELETE',
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
        setMessage('Transcript video id 1 taal be successfully deleted!');
        setTranscriptData({ naam: '', file_name: '' }); 
      })
      .catch(error => {
        setMessage('Error: ' + error.message);
      });
  };

  return (
    <div id="taalPost" className='scroll'>
      <h2>Transcript:taal DEL</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit">Delete</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Transcript_Taal_DEL;
