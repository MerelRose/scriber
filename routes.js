import express from 'express';
import db from './db.js';

const router = express.Router();

router.get('/talen', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, naam, afkorting FROM talen ORDER BY naam ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/videos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, naam, file_name, created_at FROM video ORDER BY naam ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Databasefout' });
  }
});

router.get('/transcript/:video_id', async (req, res) => {
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

router.get('/subtitle/:video_id/:taal/change', async (req, res) => {
  try {
    const { video_id } = req.params;
    const { taal } = req.params;

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

router.get('/transcript/:video_id/:taal', async (req, res) => {
  try {
    const { video_id } = req.params;
    const { taal } = req.params;

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

export default router;