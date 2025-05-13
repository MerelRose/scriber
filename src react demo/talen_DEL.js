import React, { useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Talen_DEL = () => {
  const [videoData, setVideoData] = useState({ naam: '', file_name: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/talen/q', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apikey,
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(videoData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Netwerkfout: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        setMessage('Taal afkroting q successfully deleted!');
        setVideoData({ naam: '', file_name: '' }); 
      })
      .catch(error => {
        setMessage('Error: ' + error.message);
      });
  };

  return (
    <div id="videoPost" className='scroll'>
      <h2>Talen Delete</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit">Delete</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Talen_DEL;
