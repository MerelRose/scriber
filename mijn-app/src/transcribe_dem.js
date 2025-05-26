import React, { useState } from 'react';
import { apikey, jwtToken } from './access';

const Transcribe_demo = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [segments, setSegments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
  };
// handle change met spelling controlle, werkt niet goed
  // const handleSegmentChange = async (index, field, value) => {
  //   const updatedSegments = [...segments];
  //   updatedSegments[index][field] = value;
  
  //   if (field === 'chunk') {
  //     const matches = await checkSpelling(value);
  //     updatedSegments[index].spellingIssues = matches;
  //   }
  
  //   setSegments(updatedSegments);
  // };

  const handleSegmentChange = (index, field, value) => {
    const updatedSegments = [...segments];
    updatedSegments[index][field] = value;
    setSegments(updatedSegments);
  };  

  const checkSpelling = async (text) => {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        text,
        language: 'nl'
      })
    });
  
    const result = await response.json();
    return result.matches;
  };
  

  const handleTranslate = async () => {
    const select = document.getElementById('languageSelect');
    // const targetLanguage = select.value;
    const targetLanguage = "Engels";
  
    const chunks = segments.map(seg => seg.chunk);
  
    try {
      const response = await fetch('http://localhost:4000/translate/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apikey,
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ text: chunks, to: targetLanguage })
      });
  
      if (!response.ok) {
        throw new Error('Vertaling mislukt');
      }
  
      const data = await response.json();
      const translatedChunks = data.translatedText;
  
      // Voeg vertaling toe aan segmenten
      const updatedSegments = segments.map((seg, index) => ({
        ...seg,
        translated: translatedChunks[index] || ''
      }));
  
      setSegments(updatedSegments);
    } catch (err) {
      setError(err.message);
      console.error('Vertaalfout:', err);
    }
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
        const errorText = await response.text(); // Verkrijg de fouttekst
        throw new Error(`Error in transcription: ${errorText}`);
      }

      // talen select
      fetch('http://localhost:4000/talen', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apikey,
          'Authorization': `Bearer ${jwtToken}`,
        }
      })
      .then(response => response.json())
      .then(data => {
        const select = document.getElementById('languageSelect');
        data.forEach(lang => {
          const option = document.createElement('option');
          option.value = lang.afkorting;
          option.textContent = lang.naam;
          option.title = lang.afkorting;
      
          if (lang.naam === "ENGLISH") {
            option.selected = true;
          }
      
          select.appendChild(option);
        });
      })
      .catch(error => console.error('Fout bij ophalen talen:', error));      

      const data = await response.json();
      const parsedTranscript = JSON.parse(data.transcript); // Parse the stringified JSON
      console.log('Parsed transcript:', parsedTranscript);
      const rawSegments = Array.isArray(parsedTranscript.segments?.segments) ? parsedTranscript.segments.segments: [];

      // Spellingcontrole per segment uitvoeren (asynchroon per stuk)
      const segmentsWithSpelling = await Promise.all(
        rawSegments.map(async (seg) => {
          const issues = await checkSpelling(seg.chunk);
          return {
            ...seg,
            spellingIssues: issues,
          };
        })
      );
      setSegments(segmentsWithSpelling);
    } catch (err) {
      setError(err.message);
      console.error('Transcription error:', err); // Log de fout
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Transcribe Video Link</h2>
      <p>https://anderstaligen.s3.eu-central-1.amazonaws.com/3+inspectie+szw/Intro+inspectie+SZW.mp4</p>
      <p>https://s3.eu-central-1.amazonaws.com/e-learning.swb.nl-prod/algemeen/Overeenkomst.mp4</p>
      <p>https://ollama.com/library/gemma3</p>
      <form onSubmit={handleTranscribeLinkSubmit}>
        <input
          type="text"
          value={videoUrl}
          onChange={handleVideoUrlChange}
          placeholder="Enter video URL"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Transcript Video'}
        </button>
      </form>

      {segments.length > 0 && (
        <form onSubmit={(e) => { e.preventDefault(); handleTranslate(); }}>
          <select id="languageSelect"></select>
          <button type="submit">Vertaal</button>
        </form>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Toon foutmelding */}
      <table>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Duration</th>
            <th>Tekst (nl)</th>
            <th>Tekst (vertaald)</th>
            </tr>
        </thead>
        <tbody> 
        {segments.map((seg, index) => (
          <tr key={index}>
          <td><input 
                type="text" 
                value={seg.start} 
                onChange={(e) => handleSegmentChange(index, 'start', e.target.value)}
              /></td>
          <td><input type="text" 
                value={seg.end} 
                onChange={(e) => handleSegmentChange(index, 'end', e.target.value)}
              /></td>
          <td><input 
                type="text" 
                placeholder="Duration" 
                value={seg.duration}
                onChange={(e) => handleSegmentChange(index, 'duration', e.target.value)}
              /></td>
          {/* <td><input 
                type="text" 
                value={seg.chunk} 
                onChange={(e) => handleSegmentChange(index, 'chunk', e.target.value)}
              /></td> */}
<td>
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
    <input
      type="text"
      style={{
        borderColor: seg.spellingIssues?.length > 0 ? 'red' : '',
        backgroundColor: seg.spellingIssues?.length > 0 ? '#ffe6e6' : ''
      }}
      value={seg.chunk}
      onChange={(e) => handleSegmentChange(index, 'chunk', e.target.value)}
    />
    {seg.spellingIssues?.length > 0 && (
      <div
        title={seg.spellingIssues.map(issue => issue.replacements?.[0]?.value).filter(Boolean).join(', ')}
        style={{
          marginLeft: '4px',
          color: 'red',
          cursor: 'help',
          fontWeight: 'bold'
        }}
      >
        ⚠
      </div>
    )}
  </div>
</td>
          <td><input 
                type="text" 
                placeholder="Vertaling" 
                value={seg.translated || ''}
                onChange={(e) => handleSegmentChange(index, 'translated', e.target.value)}
              /></td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transcribe_demo;
