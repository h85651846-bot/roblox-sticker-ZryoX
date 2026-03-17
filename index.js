const express = require('express');
const multer = require('multer');
const upload = multer();
const app = express();

app.post('/send-sticker', upload.single('file'), async (req, res) => {
    if (req.headers['auth-key'] !== process.env.AUTH_KEY) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const formData = new FormData();
        formData.append('payload_json', req.body.payload_json);
        
        if (req.file) {
            const blob = new Blob([req.file.buffer], { type: 'text/plain' });
            formData.append('file', blob, req.file.originalname);
        }

        const response = await fetch(`https://discord.com/api/v10/channels/${process.env.CHANNEL_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${process.env.BOT_TOKEN}`
            },
            body: formData
        });

        const result = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(result));

        res.status(200).send("Success! Embed V2 Sent.");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Bot API is Live!'));
