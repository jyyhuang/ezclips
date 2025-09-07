import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import puppeteer from "puppeteer";

class TwitchAPI {
  constructor() {
    this.headers = null;
  }

  async getClips(broadcasterId) {
    if (!this.headers) {
      throw new Error("Authentication failed");
    }
    try {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // last 2 days
      const rfc3339 = lastWeek.toISOString();

      // Step 1: Get clips metadata
      const res = await axios.get("https://api.twitch.tv/helix/clips", {
        headers: this.headers,
        params: {
          broadcaster_id: broadcasterId,
          started_at: rfc3339,
          first: 5,
        },
      });

      const clips_data = res.data.data;
      if (clips_data.length === 0) {
        console.log("No clips found.");
        return [];
      }

      // Step 2: Setup Puppeteer
      const browser = await puppeteer.launch({ headless: true });
      const clips = [];

      for (const clip of clips_data) {
        const clipPageUrl = clip.url;
        const page = await browser.newPage();
        await page.goto(clipPageUrl, { waitUntil: "networkidle2" });
        await page.waitForSelector("video");
        const mp4Url = await page.$eval("video", (el) => el.src);
        await page.close();

        // Step 3: Download .mp4
        const res = await axios.get(mp4Url, { responseType: "arraybuffer" });

        const homeDir = os.homedir();
        const clipsDir = path.join(homeDir, "clips");
        if (!fs.existsSync(clipsDir)) {
          fs.mkdirSync(clipsDir);
        }

        const clipName = clip.title.replace(/\s+/g, "-");
        const filePath = path.join(clipsDir, `${clipName}.mp4`);
        fs.writeFileSync(filePath, res.data);

        console.log(`Saved clip: ${clip.title} -> ${filePath}`);

        clips.push({
          id: clip.id,
          title: clip.title,
          file: filePath,
          mp4Url,
        });
      }
      await browser.close();
      return clips;
    } catch (err) {
      console.error("Error fetching clips:", err.response?.data || err.message);
      throw err;
    }
  }

  async getUser(name) {
    if (!this.headers) {
      throw new Error("Authentication failed");
    }
    try {
      const res = await axios.get("https://api.twitch.tv/helix/users", {
        headers: this.headers,
        params: {
          login: name,
        },
      });

      const user = res.data.data[0];
      return user;
    } catch (err) {
      console.error(
        "Error fetching top games:",
        err.response?.data || err.message,
      );
      throw err;
    }
  }

  async auth(clientID, clientSecret) {
    const parameters = new URLSearchParams({
      client_id: clientID,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    });

    try {
      const res = await axios.post(
        "https://id.twitch.tv/oauth2/token",
        parameters,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      const bearer = res.data.access_token;

      this.headers = {
        Authorization: `Bearer ${bearer}`,
        "Client-Id": clientID,
      };

      return this.headers;
    } catch (err) {
      console.error(
        "Error fetching Twitch auth token:",
        err.response?.data || err.message,
      );
      throw err;
    }
  }
}
export default TwitchAPI;
