import "dotenv/config";
import TwitchAPI from "./classes/twitch-api.js";
import express from "express";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const PORT = 3000;

const app = express();

app.get("/generate-clips", async (req, res) => {
  if (!TWITCH_CLIENT_ID || !TWITCH_SECRET) {
    console.error("Client Id or Secret not provided.");
    return res.status(500).json({ error: "Missing Twitch credentials" });
  }

  try {
    //const broadcasterName = req.query.streamer;

    const twitch = new TwitchAPI();
    await twitch.auth(TWITCH_CLIENT_ID, TWITCH_SECRET);
    const user = await twitch.getUser("jasontheween");
    const user_id = user.id;
    const clips = await twitch.getClips(user_id);
  } catch (err) {
    console.error("Error generating clips:", err);
    res.status(500).json({ error: "Failed to generate clips" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
