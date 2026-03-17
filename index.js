const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const multer = require('multer');
const upload = multer();
const app = express();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

app.post('/send-sticker', upload.single('file'), async (req, res) => {
    if (req.headers['auth-key'] !== process.env.AUTH_KEY) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        const payload = JSON.parse(req.body.payload_json);

        await channel.send({
            content: payload.content || null,
            components: payload.components || [],
            embeds: payload.embeds || [],
            files: [{
                attachment: req.file.buffer,
                name: req.file.originalname
            }]
        });

        res.status(200).send("Success! Style maintained.");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

client.login(process.env.BOT_TOKEN);
app.listen(process.env.PORT || 3000, () => console.log('Bot is Online with your Style!'));
