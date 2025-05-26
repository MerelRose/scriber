import express from 'express';
import db from '../db.js';
import validateApiKey from './validateApiKey.cjs';
import validateToken from './JWT_Token0.js';

const router = express.Router();

  
router.put('/subtitle/:video_id/:taal/update', validateApiKey, validateToken, async (req, res) => {
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

router.put('/video/:id/update', validateApiKey, validateToken, async (req, res) => {
    try {
        const { id } = req.params; 
        const { naam, file_name } = req.body;

        await db.query(
            'UPDATE video SET naam = ?, file_name = ? WHERE id = ?',
            [naam, file_name, id]
        );

        res.json({ message: 'Video succesvol bijgewerkt' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout' });
    }
});

router.put('/taal/:afkorting/update', validateApiKey, validateToken, async (req, res) => {
    try {
        const { afkorting } = req.params; 
        const { naam } = req.body;

        await db.query(
            'UPDATE talen SET naam = ? WHERE afkorting = ?',
            [naam, afkorting]
        );

        res.json({ message: 'Taal succesvol bijgewerkt' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout' });
    }
});

export default router;