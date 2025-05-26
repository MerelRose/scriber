import express from 'express';
import db from '../db.js';
import validateApiKey from './validateApiKey.cjs';
import validateToken from './JWT_Token0.js';

const router = express.Router();


router.delete('/video/:id/del', validateApiKey, validateToken, async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameter: id' });
    }

    try {
        const [rows] = await db.query('DELETE FROM `video` WHERE `id` = ?', [id]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Video niet gevonden' });
        }

        res.json({ message: 'Video succesvol verwijderd' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout' });
    }
});

router.delete('/transcript/:id/del', validateApiKey, validateToken, async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameter: id' });
    }

    try {
        const [rows] = await db.query('DELETE FROM `transcribe` WHERE `id` = ?', [id]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Transcript niet gevonden' });
        }

        res.json({ message: 'Transcript succesvol verwijderd' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout' });
    }
});

router.delete('/subtitle/:video_id/del', validateApiKey, validateToken, async (req, res) => {
    const { video_id } = req.params;

    if (!video_id) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameter: video_id' });
    }

    try {
        const [rows] = await db.query('DELETE FROM `transcribe` WHERE `video_id` = ?', [video_id]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Transcript niet gevonden' });
        }

        res.json({ message: 'Transcript volledig succesvol verwijderd' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout' });
    }
});

router.delete('/subtitle/:video_id/:taal/del', validateApiKey, validateToken, async (req, res) => {
    const { video_id, taal } = req.params;

    if (!video_id || !taal) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameters: video_id of taal' });
    }

    try {
        const [rows] = await db.query(
            'DELETE FROM `transcribe` WHERE `video_id` = ? AND `taal` = ?',
            [video_id, taal]
        );

        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Geen ondertitels gevonden voor opgegeven video en taal' });
        }

        res.json({ message: 'Alle ondertitels succesvol verwijderd' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Databasefout' });
    }
});

router.delete('/talen/:afkorting', validateApiKey, validateToken, async (req,res) => {
    const { afkorting } = req.params;

    if (!afkorting) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameter: afkorting'});
    }

    try {
        const [rows] = await db.query(
            'DELETE FROM `talen` WHERE `afkorting` = ?',
            [afkorting]
        );

        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Geen taal gevonden voor opgegeven afkorting'});
        }

        res.json({ message: 'Taal succesvol verwijderd' });
    } catch (err) {
        console.error(err);
        escape.status(500).json({ error: 'Databasefout'});
    }
});

router.delete('/talen/:naam', validateApiKey, validateToken, async (req,res) => {
    const { naam } = req.params;

    if (!naam) {
        return res.status(400).json({ error: 'Ontbrekende vereiste parameter: naam'});
    }

    try {
        const [rows] = await db.query(
            'DELETE FROM `talen` WHERE `naam` = ?',
            [naam]
        );

         
        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Geen taal gevonden voor opgegeven naam'});
        }

        res.json({ message: 'Taal succesvol verwijderd'});
    } catch (err) {
        console.error(err);
        escape.status(500).json({ error: 'Databasefout'});
    }
})

export default router;