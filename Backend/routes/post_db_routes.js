import express from 'express';
import db from '../db.js'; 

const router = express.Router();

import validateApiKey from './validateApiKey.cjs';
import validateToken from './JWT_Token0.js';

router.post('/video', validateApiKey, validateToken, async (req, res) => {
    const { naam, file_name } = req.body;

    if (!naam || !file_name) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameters: naam of file_name.' });
    }

    try {
        const [rows] = await db.query(
            'INSERT INTO `video`(`id`, `naam`, `file_name`, `created_at`) VALUES (NULL, ?, ?, NOW())',
            [naam, file_name]
        );

        res.json({ message: 'Video succesvol toegevoegd', data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout' });
    }
});

router.post('/transcript-submit', validateApiKey, validateToken, async (req, res) => {
    const { tekst, video_id, time_stamp_start, taal } = req.body;

    if (!tekst || !video_id || !time_stamp_start || !taal) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameters: tekst, video_id, time_stamp_start of taal.' });
    }

    try {
        const [rows] = await db.query(
            'INSERT INTO `transcribe`(`id`, `tekst`, `video_id`, `time_stamp_start`, `taal`, `created_at`) VALUES (NULL, ?, ?, ?, ?, NOW())',
            [tekst, video_id, time_stamp_start, taal]
        );

        res.json({ message: 'Transcript succesvol toegevoegd', data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout' });
    }
});

router.post('/talen', validateApiKey, validateToken, async (req, res) => {
    const { naam, afkorting } = req.body;

    if (!naam || !afkorting) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameters: naam, afkorting.'});
    }

    try {
        const [rows] = await db.query(
            'INSERT INTO `talen`(`id`, `naam`, `afkorting`) VALUES (NULL, ?, ?)',
            [naam, afkorting]
        );

        res.json({ message: 'Taal successvol toegevoegd', data: rows});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout'});
    }
});

export default router;