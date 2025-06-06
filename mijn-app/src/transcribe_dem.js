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

  const handleSegmentChange = (index, field, value) => {
    const updatedSegments = [...segments];
    updatedSegments[index][field] = value;
    setSegments(updatedSegments);
  };  

  async function checkSpelling(text) {
    try {
      const response = await fetch('http://localhost:4000/spelling/qwen', {
        method: 'POST',
        body: JSON.stringify({ text: [text] }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apikey,
          'Authorization': `Bearer ${jwtToken}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API fout: ${errorText}`);
      }
  
      const data = await response.json();
      const rawIssues = data.corrections || [];
      console.table(rawIssues);
  
      const issues = rawIssues.map(item => {

        return { original: item.spellingIssues[0]?.word, suggestion: item.spellingIssues[0]?.suggestion };

      }).filter(issue => issue?.original && issue?.suggestion && issue.original !== issue.suggestion);      
  
      return issues;
    } catch (error) {
      console.error('Fout in checkSpelling:', error);
      throw error;
    }
  }

  async function checkSpellingTranslated(text) {
    try {
      const response = await fetch('http://localhost:4000/spelling/qwen', {
        method: 'POST',
        body: JSON.stringify({ text: [text] }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apikey,
          'Authorization': `Bearer ${jwtToken}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API fout: ${errorText}`);
      }
  
      const data = await response.json();
      const rawIssues = data.corrections || [];
      console.table(rawIssues);
  
      const issues = rawIssues.map(item => {

        return { original: item.spellingIssues[0]?.word, suggestion: item.spellingIssues[0]?.suggestion };

      }).filter(issue => issue?.original && issue?.suggestion && issue.original !== issue.suggestion);     
  
      return issues;
    } catch (error) {
      console.error('Fout in checkSpelling:', error);
      throw error;
    }
  }
  
  
  const checkSpellingEN = async (text) => {
    const response = await fetch('https://api.languagetool.org/v2/check',{
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        text,
        language: 'en',
        disabledRules: 'UPPERCASE_SENTENCE_START'
      })
    });

    const result = await response.json();
    return result.matches;
  }

  const checkAllSpelling = async () => {
    console.log("checkAllSpelling started");
    const updatedSegments = await Promise.all(
      segments.map(async (seg, i) => {
        const spellingIssues = await checkSpelling(seg.chunk);
        console.log(seg.translated, 'Vertaalde waarde (?)')

        const spellingIssuesEN = await checkSpellingTranslated(seg.translated || '');
        console.log(`segment ${i} - issues NL: ${spellingIssues.length} - issues EN: ${spellingIssuesEN.length}`);

        console.log('---------------------------')
        console.log(spellingIssues, 'nl', Array.isArray(spellingIssues));
        console.log(spellingIssuesEN, 'en', Array.isArray(spellingIssuesEN));
        console.log('---------------------------')

        return {
          ...seg,
          spellingIssues,
          spellingIssuesEN
        };
      })
    );

    console.log(updatedSegments);
    setSegments(updatedSegments);
  };
  
  

  const handleTranslate = async () => {
    const select = document.getElementById('languageSelect');
    const targetLanguage = "English";
  
    const chunks = segments.map(seg => seg.chunk);
  // gemma3
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
      const segmentsWithSpellingEN = await Promise.all(
        updatedSegments.map(async (seg) => {
          console.log(seg.translated, 'Vertaalde waarde (?)')
          const issues = await checkSpellingTranslated(seg.translated);
          return {
            ...seg,
            spellingIssuesEN: issues,
          };
        })
      );      
      setSegments(segmentsWithSpellingEN);
  
      // setSegments(updatedSegments);
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
      <p>https://ollama.com/library/mixtral</p>
      <form onSubmit={handleTranscribeLinkSubmit}>
        <input
          name='URL'
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
          {/* <select id="languageSelect"></select> */}
          <button type="submit">Vertaal naar Engels</button>
        </form>
      )}

      <button onClick={checkAllSpelling}>Spellingcontrole</button>


      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Toon foutmelding */}
      <table>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Duration (sec)</th>
            <th>Tekst (nl)</th>
            <th>Tekst (vertaald)</th>
            </tr>
        </thead>
        <tbody> 
        {segments.map((seg, index) => (
          <tr key={index}>
          <td><input 
                name='Start timestamp'
                type="text" 
                value={seg.start} 
                onChange={(e) => handleSegmentChange(index, 'start', e.target.value)}
              /></td>
          <td><input type="text" 
                name='End timestamp'
                value={seg.end} 
                onChange={(e) => handleSegmentChange(index, 'end', e.target.value)}
              /></td>
          <td><input 
                name='Duration'
                type="text" 
                placeholder="Duration" 
                value={seg.duration}
                onChange={(e) => handleSegmentChange(index, 'duration', e.target.value)}
              /></td>
          <td>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                name='Transcriptie'
                type="text"
                style={{
                  borderColor: seg.spellingIssues?.length > 0 ? 'red' : '',
                  backgroundColor: seg.spellingIssues?.length > 0 ? '#ffe6e6' : ''
                }}
                value={seg.chunk}
                onChange={(e) => handleSegmentChange(index, 'chunk', e.target.value)}
              />
              {seg.spellingIssues?.some(issue => issue.original && issue.suggestion) && (
                <div
                title={seg.spellingIssues
                  .filter(issue => issue.original && issue.suggestion)
                  .map(issue => `${issue.original} → ${issue.suggestion}`)
                  .join('\n')}                
                  style={{
                    marginLeft: '4px',
                    color: 'red',
                    cursor: 'help',
                    fontWeight: 'bold'
                  }}
                  onClick={async () => {
                    const issues = await checkSpelling(seg.chunk);
                    const updatedSegments = [...segments];
                    updatedSegments[index].spellingIssues = issues;
                    setSegments(updatedSegments);
                  }}
                >
                  ⚠
                </div>
              )}
            </div>
          </td>
          <td>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                name='Vertaalde stanscriptie'
                type="text"
                style={{
                  borderColor: seg.spellingIssuesEN?.length > 0 ? 'red' : '',
                  backgroundColor: seg.spellingIssuesEN?.length > 0 ? '#ffe6e6' : ''
                }}
                value={seg.translated}
                onChange={(e) => handleSegmentChange(index, 'translated', e.target.value)}
              />
              {seg.spellingIssuesEN?.length > 0 && (
                <div
                  title={seg.spellingIssuesEN.map(issue => issue.replacements?.[0]?.value).filter(Boolean).join(', ')}
                  style={{
                    marginLeft: '4px',
                    color: 'red',
                    cursor: 'help',
                    fontWeight: 'bold'
                  }}
                  onClick={async () => {
                    const issues = await checkSpellingTranslated(seg.translated);
                    const updatedSegments = [...segments];
                    updatedSegments[index].spellingIssuesEN = issues;
                    setSegments(updatedSegments);
                  }}                  
                >
                  ⚠
                </div>
              )}
            </div>
          </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transcribe_demo;
