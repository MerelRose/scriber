// Importeer de Express.js bibliotheek om een webserver te maken
import express from 'express';
// Importeer de 'path' en 'url' module om bestands- en maproutes te beheren
import path from 'path';
import { fileURLToPath } from 'url';
// Importeer 'exec' om externe programma's (zoals Python) uit te voeren
import { exec } from 'child_process';
// Importeer 'fs' voor bestandsbeheer
import fs from 'fs';
// Importeer 'fluent-ffmpeg' om audio te converteren
import ffmpeg from 'fluent-ffmpeg';
// Importeer 'multer' om bestanden te uploaden
import multer from 'multer';
// Importeer functies om API-sleutels en tokens te valideren
import validateApiKey from './validateApiKey.cjs';
import validateToken from './JWT_Token0.js';

// Maak een router voor het beheer van API-routes
const router = express.Router();
// Configureer 'multer' om geüploade bestanden op te slaan in de 'uploads/' map
const upload = multer({ dest: 'uploads/' });

import pkg from 'yt-dlp-wrap';
import { type } from 'os';
const YTDlpWrap = pkg.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ytDlpPath = path.join(__dirname, 'bin', 'yt-dlp.exe');
const ytDlpWrap = new YTDlpWrap(ytDlpPath);

/**
 * API-endpoint om audio uit een video te halen via een URL en deze te transcriberen
 */
router.post('/transcribe/link', validateApiKey, validateToken, async (req, res) => {
    try {
        const { videoUrl } = req.body;

        // Controleer of een video-URL is meegegeven
        if (!videoUrl) {
            return res.status(400).send('Geen video-URL ontvangen.');
        }

        console.log("Downloading video and extracting audio...");
        
        // Bepaal het pad waar het audiobestand opgeslagen wordt
        const audioPath = path.join(process.cwd(), 'uploads', `audio_${Date.now()}.wav`);

        // Gebruik yt-dlp-wrap om de audio uit de video te downloaden en op te slaan als WAV
        ytDlpWrap.exec([
            videoUrl,
            '-x',
            '--audio-format', 'wav',
            '-o', audioPath
        ])
        .on('error', (err) => {
            console.error(`Download error: ${err.message}`);
            return res.status(500).send('Er is iets misgegaan bij het downloaden of converteren van de video.');
        })
        .on('close', () => {
            console.log("Audio geconverteerd:", audioPath);
        
            // Voer het transcriptiescript uit op het gedownloade audiobestand
            exec(`python transcribe.py "${audioPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Transcription error: ${error.message}`);
                    return res.status(500).send('Er is iets misgegaan bij de transcriptie.');
                }
        
                console.log('Transcriptie voltooid:', stdout);
        
                // Verwijder het audiobestand na verwerking
                fs.unlinkSync(audioPath);
        
                res.json({ transcript: stdout });
            });
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Serverfout bij het verwerken van de video.');
    }
});

/**
 * API-endpoint om een geüpload audiobestand om te zetten naar WAV en te transcriberen
 */
router.post('/transcribe', validateApiKey, validateToken, upload.single('audio'), async (req, res) => {
    try {
        
        const inputPath = req.file.path;  // Verkrijg het geüploade audiobestand
        const outputPath = `${inputPath}.wav`;  // Bepaal het geconverteerde bestandspad

        console.log("Converting audio to WAV...");
        
        // Gebruik ffmpeg om het audiobestand te converteren naar WAV
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioChannels(1) // Zet audio om naar één kanaal (mono)
                .audioFrequency(16000) // Pas de sample rate aan voor transcriptie
                .audioCodec('pcm_s16le') // Gebruik een geschikt codec
                .toFormat('wav') // Converteer naar WAV-formaat
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });

        console.log("Audio geconverteerd:", outputPath);

        // Voer het transcriptiescript uit
        exec(`python transcribe.py ${outputPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Transcription error: ${error.message}`);
                res.status(500).send('Er is iets misgegaan bij de transcriptie.');
                return;
            }

            console.log('Transcriptie voltooid:', stdout);

            // Verwijder tijdelijke audiobestanden
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);

            res.json({ transcript: stdout });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Serverfout tijdens transcriptie.' });
    }
});

  router.post('/translate/mistral', async (req, res) => {
    const { text, to } = req.body;
  
    if (!Array.isArray(text) || !to) {
      return res.status(400).json({ error: 'text moet een array zijn en to moet opgegeven worden' });
    }
    // http://localhost:11434/api/generate
    try {
      const translations = await Promise.all(
        text.map(async (chunk) => {
          const response = await fetch('http://136.243.80.244:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gemma3:12b-it-qat',
              prompt: `You are a translator, you translate from Dutch to ${to}. Assist with the following instructions:

                        # INSTRUCTIONS
                        - Read the entire sentence, take note of quotations.
                        - Translate the entire sentence, do not add any aditional quatations to the end of the sentence.
                        - Return the text that you have translated, if you do not know the asked or given language then give back an array with 'The given or asked language is not supported'.
                        - Do not make suggestions on the array of strings or any explanations.
                        - Do not return anything else but the translated text.

                        # CONTEXT
                        ${chunk} `,
              temperature: 0.2,
              stream: false
            })
            
          });
  
          const data = await response.json();
          console.log('Ollama raw response:', JSON.stringify(data, null, 2));          
  
          return data?.response?.trim() || 'Geen vertaling';
        })
      );
  
      res.json({ translatedText: translations });
    } catch (err) {
      console.error('Vertaalfout:', err);
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/spelling/qwen', validateApiKey, validateToken, async (req, res) => {
    const { text } = req.body;
  
    if (!Array.isArray(text)) {
      return res.status(400).json({ error: 'text moet een array zijn' });
    }
  
    try {
      const corrections = await Promise.all(
        text.map(async (chunk) => {
          const prompt = `
                          You are a multilingual spellchecker. You will receive a short segment of a transcript from an educational video. The transcript may be in any language. Some of the text chunks are very short and may lack context. Still, do your best to detect and fix only obvious spelling errors. If the input is too short to evaluate properly, or if there are no spelling mistakes, return {"spelling-error": []}. Return only valid JSON. Do not explain anything.

                          # INSTRUCTIONS:
                          - First, detect the language automatically based on the text after CONTEXT.
                          - Then, check ONLY for spelling mistakes or characters that don't belong in the detected language. There can be more than one spelling errors.
                          - DO NOT correct grammar or word choice.
                          - DO NOT guess — only return if you're confident the word is incorrect and your suggestion is a real improvement.
                          - Return only valid JSON without extra whitespace or new lines.
                          - Return exactly this structure every time:
                            {
                              "spelling-error": [
                                { "word": "wrongWord", "suggestion": "correctWord" }
                              ]
                            }

                          # CONTEXT
                          ${chunk}
                          `;
  
          const response = await fetch('http://136.243.80.244:11434/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gemma3:12b',
              messages: [
                {
                  role: 'system',
                  content: 'Return only valid JSON. Do not explain or think out loud.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.2,
              format: {
                "type": "object",
                "properties": {
                  "spelling-error": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "word": { "type": "string" },
                        "suggestion": { "type": "string" }
                      },
                      "required": ["word", "suggestion"]
                    }
                  }
                }
              }
              ,
              stream: false,
            }),
          });
  
          const data = await response.json();
          const output = (data?.message?.content || '').trim();
          console.log('output:' + output);
          console.log(data);

          let parsed = [];
          try {
            const cleaned = output.replace(/[\n\r]+/g, '').trim();
            
            if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
              console.log('Geldige JSON gedetecteerd:', cleaned);
              const json = JSON.parse(cleaned);
          
              if (
                json &&
                typeof json === 'object' &&
                Array.isArray(json["spelling-error"])
              ) {
                parsed = json["spelling-error"].map(entry => ({
                  word: entry.word?.trim(),
                  suggestion: entry.suggestion?.trim()
                }));
              } else {
                console.warn('JSON zonder geldige spelling-error array:', json);
              }
            } else {
              console.warn('Geen correcte JSON herkend:', cleaned);
            }
          } catch (err) {
            console.error('Fout bij JSON-parsen van output:', cleaned, err);
          } 
          return {
            original: chunk,
            spellingIssues: parsed,
          };
        })
      );
  
      res.json({ corrections });
    } catch (err) {
      console.error('Qwen spelling-check fout:', err);
      res.status(500).json({ error: 'Qwen spelling-check mislukte' });
    }
  });
  
export default router;
