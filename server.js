import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
import fs from 'fs';
import fetch from 'node-fetch'; 
import routes from './routes.js'; 
import db from './db.js';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const upload = multer({ dest: 'uploads/' });

// Middleware to parse JSON
app.use(express.json());
app.use('/', routes);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// opera laat soms niet transcript zien, oplossing:
import cors from 'cors';
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    credentials: true
}));

io.on('connection', (socket) => {
  console.log('Een client is verbonden via Socket.IO');

  socket.on('start_transcription', (data) => {
    console.log('Start transcriptie aangevraagd:', data);
  });
});

app.post('/transcribe/link', async (req, res) => {
  try {
    const videoUrl = req.body.videoUrl;

    if (!videoUrl) {
      res.status(400).send('Geen video-URL ontvangen.');
      return;
    }

    console.log("Downloading video and extracting audio...");
    // const path = require('path');
    const audioPath = path.join(__dirname, 'uploads', `audio_${Date.now()}.wav`);    

    exec(`yt-dlp -x --audio-format wav -o "${audioPath}" "${videoUrl}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Download error: ${error.message}`);
        res.status(500).send('Er is iets misgegaan bij het downloaden of converteren van de video.');
        return;
      }

      console.log("Audio geconverteerd:", stdout);

      io.emit('progress', { percentage: 34 });
      console.log(`Running command: python transcribe.py ${audioPath}`);
      exec(`python transcribe.py ${audioPath}`, (error, stdout, stderr) => {
          if (error) {
              console.error(`Execution error: ${error.message}`);
              console.error(`stderr: ${stderr}`); 
              return;
          }
      });
      io.emit('progress', { percentage: 58 });
      exec(`python transcribe.py ${audioPath}`, (error, stdout) => {
        console.log("Python transcription...");
        if (error) {
          console.error(`Transcription error: ${error.message}`);
          io.emit('error', { message: 'Er is iets misgegaan bij de transcriptie.' });
          res.status(500).send('Er is iets misgegaan bij de transcriptie.');
          return;
        }
        io.emit('progress', { percentage: 77 });
        console.log("Bezig Python transcription...");
  
        console.log('Transcriptie voltooid:', stdout);
        io.emit('progress', { percentage: 100, message: "Transcript voltooid!" }); 
        res.json({ transcript: stdout }); 
        fs.unlinkSync(audioPath);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Serverfout bij het verwerken van de video.');
  }
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `${inputPath}.wav`;

    console.log("Converting audio to WAV...");
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioChannels(1)
        .audioFrequency(16000)
        .audioCodec('pcm_s16le')
        .toFormat('wav')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
    io.emit('progress', { percentage: 34 });
    console.log(`Running command: python transcribe.py ${outputPath}`);
    exec(`python transcribe.py ${outputPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution error: ${error.message}`);
            console.error(`stderr: ${stderr}`); 
            return;
        }
    });
    io.emit('progress', { percentage: 58 });
    exec(`python transcribe.py ${outputPath}`, (error, stdout) => {
      console.log("Python transcription...");
      if (error) {
        console.error(`Transcription error: ${error.message}`);
        io.emit('error', { message: 'Er is iets misgegaan bij de transcriptie.' });
        res.status(500).send('Er is iets misgegaan bij de transcriptie.');
        return;
      }
      io.emit('progress', { percentage: 77 });
      console.log("Bezig Python transcription...");

      console.log('Transcriptie voltooid:', stdout);
      io.emit('progress', { percentage: 100, message: "Transcript voltooid!" }); 
      res.json({ transcript: stdout }); 
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error(error);
    io.emit('error', { message: 'Serverfout tijdens transcriptie.' });
    res.status(500).json({ error: error.message });
  }
});

app.post('/translate', async (req, res) => {
  const { text, to } = req.body;

  try {
    const apiResponse = await fetch('http://localhost:8000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, to })
    });

    if (!apiResponse.ok) {
      throw new Error('Fout bij communicatie met de vertaalserver');
    }

    const data = await apiResponse.json();
    res.json({ translatedText: data.translatedText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/video', async (req, res) => {
  try {
    const [rows] = await db.query(
      'INSERT INTO `video`(`id`, `naam`, `file_name`, `created_at`) VALUES (NULL, ?, ?, NOW())',
      [req.body.naam, req.body.file_name]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

app.post('/transcript-submit', async (req, res) => {
  try {
    const { tekst, video_id, time_stamp_start, taal } = req.body;

    const [rows] = await db.query(
      'INSERT INTO `transcribe`(`id`, `tekst`, `video_id`, `time_stamp_start`, `taal`, `created_at`) VALUES (NULL, ?, ?, ?, ?, NOW())',
      [tekst, video_id, time_stamp_start, taal]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .vtt 'niet supported', karin vragen hoe ze dat willen zien.
app.get('/subtitle/:video_id', async (req, res) => {
  const video_id = req.params.video_id;
  try {
    const [timeData] = await db.query(
      'SELECT time_stamp_start FROM transcribe WHERE video_id = ? ORDER BY time_stamp_start',
      [video_id]
    );
    const [subtitleData] = await db.query(
      'SELECT tekst FROM transcribe WHERE video_id = ? ORDER BY time_stamp_start',
      [video_id]
    );
    
    let vttContent = 'WEBVTT\n\n';

    const length = Math.min(timeData.length, subtitleData.length);

    for (let index = 0; index < length; index++) {
      const time = timeData[index]?.time_stamp_start;
      const subtitle = subtitleData[index]?.tekst || '';

      vttContent += `${time}\n${subtitle}\n\n`;
    }

    const tempFilePath = path.join(__dirname, 'public', 'temp', `${video_id}.vtt`);
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });

    fs.writeFile(tempFilePath, vttContent, (err) => {
      if (err) {
        console.error('Fout bij het schrijven naar bestand:', err);
        return res.status(500).send('Fout bij het opslaan van ondertitels');
      }

      res.send({ filePath: tempFilePath });
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Fout bij het ophalen van ondertitels');
  }
});
fs.mkdirSync(path.join(__dirname, 'public', 'temp'), { recursive: true });

app.post('/subtitle/:video_id/:taal/update', async (req, res) => {
  try {
    const { video_id, taal } = req.params;
    const { tekst, timeStampStart, id } = req.body;

    if (!Array.isArray(tekst) || !Array.isArray(timeStampStart) || !Array.isArray(id)) {
      return res.status(400).json({ error: 'Verkeerd formaat voor tekst, tijdstempel of id' });
    }

    if (tekst.length !== timeStampStart.length || tekst.length !== id.length) {
      return res.status(400).json({ error: 'Aantal teksten, tijdstempels en ids komt niet overeen' });
    }

    for (let i = 0; i < tekst.length; i++) {
      await db.query(
        'UPDATE transcribe SET tekst = ?, time_stamp_start = ? WHERE video_id = ? AND taal = ? AND id = ?',
        [tekst[i], timeStampStart[i], video_id, taal, id[i]] 
      );
    }

    res.json({ message: 'Alle ondertitels succesvol bijgewerkt' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});


server.listen(3000, () => {
  console.log('Server draait op http://localhost:3000');
});
