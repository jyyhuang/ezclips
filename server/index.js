import "dotenv/config";
import TwitchAPI from "./classes/twitch-api.js";
import express from "express";
import cors from "cors";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const PORT = 3000;

const app = express();

app.use(cors());

app.get("/generate-clips", async (req, res) => {
  if (!TWITCH_CLIENT_ID || !TWITCH_SECRET) {
    return res.status(500).json({ error: "Missing Twitch credentials" });
  }

  try {
    const broadcasterName = req.query.streamer;
    const days = Number(req.query.days);
    const amount = Number(req.query.amount);
    if (!broadcasterName) {
      return res.status(400).json({ error: "Missing streamer name" });
    }

    const twitch = new TwitchAPI();
    await twitch.auth(TWITCH_CLIENT_ID, TWITCH_SECRET);
    const user = await twitch.getUser(broadcasterName);

    const user_id = user.id;
    const clips = await twitch.getClips(user_id, days, amount);

    res.json({ streamer: broadcasterName, clips });
  } catch (err) {
    console.error("Error generating clips:", err);
    res.status(500).json({ error: "Failed to generate clips" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
