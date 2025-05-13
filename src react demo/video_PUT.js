import React, { useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Video_PUT = () => {
  const [videoData, setVideoData] = useState({ naam: '', file_name: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVideoData({ ...videoData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/video/2/update', {
      method: 'PUT',
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
        setMessage('Video successfully changed!');
        setVideoData({ naam: '', file_name: '' }); 
      })
      .catch(error => {
        setMessage('Error: ' + error.message);
      });
  };

  return (
    <div id="videoPost" className='scroll'>
      <h2>Video PUT</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Naam:
            <input
              type="text"
              name="naam"
              value={videoData.naam}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            File Name:
            <input
              type="text"
              name="file_name"
              value={videoData.file_name}
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

export default Video_PUT;
