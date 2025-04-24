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

// opera laat soms niet transcript zien, oplossing:
import cors from 'cors';
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());
app.use('/', routes);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Een client is verbonden via Socket.IO');

  socket.on('start_transcription', (data) => {
    console.log('Start transcriptie aangevraagd:', data);
  });
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
app.get('/subtitle/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  try {
    const timeRecords = await db.query(
      'SELECT time_stamp_start FROM transcribe WHERE video_id = ? ORDER BY time_stamp_start',
      [videoId]
    );
    const subtitles = await db.query(
      'SELECT tekst FROM transcribe WHERE video_id = ? ORDER BY time_stamp_start',
      [videoId]
    );
  
    const timeData = timeRecords[0]; 
    const subtitleData = subtitles[0];
  
    let vttContent = 'WEBVTT\n\n';
  
    const length = Math.min(timeData.length, subtitleData.length);
    
    for (let index = 0; index < length; index++) {
      const time = timeData[index]?.time_stamp_start;
      const subtitle = subtitleData[index]?.tekst || ''; 
  
      vttContent += `${time}\n${subtitle}\n\n`;
      vttContent += 'blahblah';
      console.log('time'+time);
      console.log('subtitle'+subtitle);
    }
  
    console.log(vttContent);
    const tempFilePath = path.join(__dirname, 'public', 'temp', `${videoId}.vtt`);
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/subtitle/:videoId/:taal/update', async (req, res) => {
  try {
    const { videoId, taal } = req.params;
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
        [tekst[i], timeStampStart[i], videoId, taal, id[i]] 
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
