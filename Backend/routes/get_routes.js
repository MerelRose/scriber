import express from 'express';
import db from '../db.js';

import path from 'path';
import fs from 'fs';

import validateApiKey from './validateApiKey.cjs';
import validateToken from './JWT_Token0.js';

const router = express.Router();

router.get('/talen', validateApiKey, validateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, naam, afkorting FROM talen ORDER BY naam ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/talen/:id', validateApiKey, validateToken, async (req,res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT id, naam, afkorting FROM talen WHERE id = ? ORDER BY naam ASC', [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout'});
  }
});

router.get('/talen/:naam', validateApiKey, validateToken, async (req,res) => {
  try {
    const { naam } = req.params;

    const [rows] = await db.query('SELECT id, naam, afkorting FROM talen WHERE naam = ? ORDER BY naam ASC', [naam]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout'});
  }
});

router.get('/talen/:afkorting', validateApiKey, validateToken, async (req,res) => {
  try {
    const { afkorting } = req.params;

    const [rows] = await db.query('SELECT id, naam, afkorting FROM talen WHERE afkorting = ? ORDER BY naam ASC', [afkorting]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/videos', validateApiKey, validateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, naam, file_name, created_at FROM video ORDER BY naam ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/videos/:id', validateApiKey, validateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT id, naam, file_name, created_at FROM video ORDER BY naam ASC', [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/videos/:naam', validateApiKey, validateToken, async (req,res) => {
  try {
    const { naam } = req.params;

    const [rows] = await db.query('SELECT id, naam, file_name, created_at FROM video ORDER BY naam ASC', [naam]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/videos/:file_name', validateApiKey, validateToken, async (req,res) => {
  try {
    const { file_name } = req.params;

    const [rows] = await db.query('SELECT id, naam,file_name, created_at FROM video ORDER BY naam ASC', [file_name]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout'});
  }
});

router.get('/transcript', validateApiKey, validateToken, async (req,res) => {
  try {
    const [rows] = await db.query('SELECT id, tekst, video_id, time_stamp_start, taal, created_at FROM transcribe ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/transcript/:video_id', validateApiKey, validateToken, async (req, res) => {
  try {
    const { video_id } = req.params;

    const [rows] = await db.query(
      'SELECT id, tekst, video_id, time_stamp_start, taal, created_at FROM transcribe WHERE video_id = ? ORDER BY created_at ASC',
      [video_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/transcript/:video_id/:taal', validateApiKey, validateToken, async (req, res) => {
  try {
    const { video_id, taal } = req.params;

    const [rows] = await db.query(
      'SELECT id, tekst, video_id, time_stamp_start, taal, created_at FROM transcribe WHERE video_id = ? AND taal = ? ORDER BY created_at ASC',
      [video_id, taal]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/transcript/:video_id/:time_stamp_start', validateApiKey, validateToken, async (req,res) => {
  try {
    const { video_id, time_stamp_start } = req.params;

    const [rows] = await db.query(
      'SELECT id, tekst, video_id, time_stamp_start, taal, created_at FROM transcribe WHERE video_id = ? AND time_stamp_start = ? ORDER BY created_at ASC',
      [ video_id, time_stamp_start]   
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

// .vtt
router.get('/subtitle/:video_id', validateApiKey, validateToken, async (req, res) => {
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

        const tempFilePath = path.join(process.cwd(), 'public', `${video_id}.vtt`);
        fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });

        fs.writeFile(tempFilePath, vttContent, (err) => {
            if (err) {
                console.error('Fout bij het schrijven naar bestand:', err);
                return res.status(500).send('Fout bij het opslaan van ondertitels');
            }

            res.json({ filePath: tempFilePath }); 
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Fout bij het ophalen van ondertitels');
    }
});
fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });

export default router;
