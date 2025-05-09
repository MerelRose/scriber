// Importeer de Express.js bibliotheek om een webserver te maken
import express from 'express';
// Importeer de 'path' module om bestands- en maproutes te beheren
import path from 'path';
// Importeer 'exec' om externe programma's (zoals Python of yt-dlp) uit te voeren
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

        // Gebruik yt-dlp om de audio uit de video te downloaden en op te slaan als WAV
        exec(`yt-dlp -x --audio-format wav -o "${audioPath}" "${videoUrl}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Download error: ${error.message}`);
                return res.status(500).send('Er is iets misgegaan bij het downloaden of converteren van de video.');
            }

            console.log("Audio geconverteerd:", stdout);

            // Voer het transcriptiescript uit op het gedownloade audiobestand
            exec(`python transcribe.py ${audioPath}`, (error, stdout, stderr) => {
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
router.post('/translate', validateApiKey, validateToken, async (req, res) => {
    const { text, to } = req.body;

    // Controleer of de juiste parameters zijn meegegeven
    if (!text || !to) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameters: text of to.' });
    }

    try {
        // Vraag een vertaling aan bij een externe server
        const apiResponse = await fetch('http://localhost:8000/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, to })
        });

        if (!apiResponse.ok) {
            throw new Error('Fout bij communicatie met de vertaalserver');
        }

        // Verwerk het antwoord en stuur de vertaalde tekst terug
        const data = await apiResponse.json();
        res.json({ translatedText: data.translatedText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message }); 
    }
});

export default router; // Exporteer de router voor gebruik in de hoofdserver
