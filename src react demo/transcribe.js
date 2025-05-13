import React, { useState } from 'react';
import { apikey, jwtToken } from './access'; // Import your API keys

const Transcribe = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
  };

  const handleAudioFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleTranscribeLinkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/transcribe/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apikey,
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Error in transcription');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribeFileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch('http://localhost:4000/transcribe', {
        method: 'POST',
        headers: {
          'x-api-key': apikey,
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error in transcription');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='scroll'>
      <h2>Transcribe Video Link</h2>
      <form onSubmit={handleTranscribeLinkSubmit}>
        <input
          type="text"
          value={videoUrl}
          onChange={handleVideoUrlChange}
          placeholder="Enter video URL"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Transcribe Video'}
        </button>
      </form>

      <h2>Transcribe Audio File</h2>
      <form onSubmit={handleTranscribeFileSubmit}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioFileChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Transcribe Audio'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {transcript && (
        <div>
          <h3>Transcript:</h3>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default Transcribe;
