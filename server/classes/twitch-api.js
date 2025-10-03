import axios from "axios";
import puppeteer from "puppeteer";

function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9_\-]/gi, "_") // replace non-alphanumeric with _
    .replace(/_+/g, "_") // collapse multiple underscores
    .substring(0, 100); // keep under 100 chars
}

class TwitchAPI {
  constructor() {
    this.headers = null;
  }

  async getClips(broadcasterId, days, amount) {
    if (!this.headers) {
      throw new Error("Authentication failed");
    }
    try {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const rfc3339 = lastWeek.toISOString();

      const res = await axios.get("https://api.twitch.tv/helix/clips", {
        headers: this.headers,
        params: {
          broadcaster_id: broadcasterId,
          started_at: rfc3339,
          first: amount,
        },
      });

      const clips_data = res.data.data;
      if (clips_data.length === 0) {
        console.log("No clips found.");
        return [];
      }

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const results = [];

      for (const clip of clips_data) {
        await page.goto(clip.url, { waitUntil: "networkidle2" });
        await page.waitForSelector("video");
        const mp4Url = await page.$eval("video", (el) => el.src);
        const safeFileName = sanitizeFilename(clip.title);

        results.push({
          id: clip.id,
          title: clip.title,
          mp4Url,
          filename: `${safeFileName}.mp4`,
        });
      }

      await page.close();
      await browser.close();

      return results;
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
