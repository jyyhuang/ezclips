import axios from "axios";

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

      const results = [];

      for (const clip of clips_data) {
        const clipId = clip.id;
        // gql query
        const response = await fetch("https://gql.twitch.tv/gql", {
          method: "POST",
          headers: {
            "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operationName: "ShareClipRenderStatus",
            variables: { slug: clipId },
            extensions: {
              persistedQuery: {
                version: 1,
                sha256Hash:
                  "f130048a462a0ac86bb54d653c968c514e9ab9ca94db52368c1179e97b0f16eb",
              },
            },
          }),
        });

        const data = await response.json();
        const c = data.data.clip;
        const quality = c.videoQualities[0];
        const downloadUrl = `${quality.sourceURL}?sig=${c.playbackAccessToken.signature}&token=${encodeURIComponent(c.playbackAccessToken.value)}`;

        const safeFileName = sanitizeFilename(clip.title);
        results.push({
          id: clipId,
          title: clip.title,
          downloadUrl,
          filename: `${safeFileName}.mp4`,
          thumbnailUrl: c.thumbnailURL
        });
      }
      console.log(results);

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
