import React, { useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Video_Del = () => {
  const [videoData, setVideoData] = useState({ naam: '', file_name: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/video/2/del', {
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
        setMessage('Video id 2 successfully deleted!');
        setVideoData({ naam: '', file_name: '' }); 
      })
      .catch(error => {
        setMessage('Error: ' + error.message);
      });
  };

  return (
    <div id="videoPost" className='scroll'>
      <h2>Video DEL</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit">Delete</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Video_Del;
