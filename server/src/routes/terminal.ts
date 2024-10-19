// server/src/routes/terminal.ts
import express from 'express';
import { exec } from 'child_process';

const router = express.Router();

router.post('/execute', (req, res) => {
    const { command } = req.body;

    // Basic validation to allow only certain commands
    const allowedCommands = ['git status', 'git add', 'git commit', 'git push', 'git pull'];
    if (!allowedCommands.includes(command)) {
        return res.status(400).json({ error: 'Command not allowed.' });
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            return res.status(500).json({ error: stderr });
        }
        res.json({ output: stdout });
    });
});

export default router;