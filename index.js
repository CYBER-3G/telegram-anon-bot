import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  // Allow only private messages
  if (message.chat.type !== "private") return res.sendStatus(200);

  const text = message.text || "";

  // Block links
  const linkRegex = /(https?:\/\/|www\.|t\.me|telegram\.me)/i;
  if (linkRegex.test(text)) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: "❌ Links are not allowed"
      })
    });
    return res.sendStatus(200);
  }

  // Forward anonymously to group
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: GROUP_ID,
      text: `🕶 Anonymous Message:\n\n${text}`
    })
  });

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot running on port", PORT);
});
