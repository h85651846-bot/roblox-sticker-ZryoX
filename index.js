const express = require('express');
const multer = require('multer');
const upload = multer();
const app = express();

app.use(express.json());

app.post('/send-sticker', upload.single('file'), async (req, res) => {
    const authKey = req.headers['auth-key'];
    if (authKey !== process.env.AUTH_KEY) {
        return res.status(401).json({ 
            success: false, 
            error: "Unauthorized" 
        });
    }

    try {
        const formData = new FormData();
        
        if (req.body.payload_json) {
            formData.append('payload_json', req.body.payload_json);
        } else {
            return res.status(400).json({ success: false, error: "Missing payload" });
        }
        
        if (req.file) {
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'text/plain' });
            formData.append('file', blob, req.file.originalname || 'sticker.txt');
        }

        const discordUrl = `https://discord.com/api/v10/channels/${process.env.CHANNEL_ID}/messages`;
        const discordResponse = await fetch(discordUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${process.env.BOT_TOKEN}`
            },
            body: formData
        });

        const contentType = discordResponse.headers.get("content-type");
        let result;
        
        if (contentType && contentType.includes("application/json")) {
            result = await discordResponse.json();
        } else {
            result = await discordResponse.text();
        }
        
        if (!discordResponse.ok) {
            return res.status(discordResponse.status).json({ 
                success: false, 
                detail: result 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Sent" 
        });

    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send("Online");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Live on ${PORT}`));
