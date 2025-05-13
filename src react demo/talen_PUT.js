import React, { useState } from 'react';
import './App.css';
import { apikey, jwtToken } from './access';

const Talen_PUT = () => {
  const [taalData, setTaalData] = useState({ naam: '', file_name: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaalData({ ...taalData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/taal/q/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apikey,
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(taalData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Netwerkfout: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        setMessage('Taal successfully added!');
        setTaalData({ naam: '', file_name: '' }); 
      })
      .catch(error => {
        setMessage('Error: ' + error.message);
      });
  };

  return (
    <div id="taalPost" className='scroll'>
      <h2>Talen PUT</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Naam:
            <input
              type="text"
              name="naam"
              value={taalData.naam}
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

export default Talen_PUT;
