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

/**
 * API-endpoint om tekst te vertalen via een externe vertaalserver
 */
router.post('/translateh', validateApiKey, validateToken, async (req, res) => {
    const { text, to } = req.body;
  
    if (!Array.isArray(text) || !to) {
      return res.status(400).json({ error: 'text moet een array zijn en to moet opgegeven worden' });
    }
  
    try {
      const translations = await Promise.all(
        text.map(async (chunk) => {
          const response = await fetch('http://localhost:8000/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: chunk, to })
          });
  
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Fout bij vertalen van chunk:', chunk, errorText);
            throw new Error('Vertaling van een chunk is mislukt');
          }
  
          const data = await response.json();
          return data.translatedText;
        })
      );
  
      res.json({ translatedText: translations });
    } catch (error) {
      console.error('Vertaalserver fout:', error);
      res.status(500).json({ error: error.message });
    }
  });

  
// mistral ai model. taal support, met opmerkingen/kwaliteit:
// (3) engels & frans (beide zijn zeer goed)
// (2) duits, spaans & taliaans (alle 3 zijn goed)
// (1) nederlands(redelijk, soms inconsistent) & portugees(acceptabel)
  router.post('/translate/mistral', async (req, res) => {
    const { text, to } = req.body;
  
    if (!Array.isArray(text) || !to) {
      return res.status(400).json({ error: 'text moet een array zijn en to moet opgegeven worden' });
    }
  
    try {
      const translations = await Promise.all(
        text.map(async (chunk) => {
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'mistral',
              prompt: `Vertaal dit naar ${to}. Voeg absoluut geen uitleg, informatie of alternatieven toe. Geef alleen de vertaalde tekst terug van de opgegeven tekst:\n${chunk}`,
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
  
export default router;
