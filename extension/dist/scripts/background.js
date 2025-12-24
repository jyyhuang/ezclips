chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_VIDEO") {
    // Handle the fetch
    handleVideoFetch(request.url)
      .then((dataUrl) => {
        sendResponse({ success: true, dataUrl });
      })
      .catch((error) => {
        console.error("Background: Fetch failed:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open
  }

  return false;
});

async function handleVideoFetch(url) {
  const dataUrl = await fetchVideoAsDataUrl(url);
  return dataUrl;
}

async function fetchVideoAsDataUrl(url) {
  try {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36>",
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Sec-Ch-Ua":
          '"Google Chrome";v="140", "Chromium";v="140", "Not=A?Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Linux"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": randomUA,
      },
      credentials: "omit",
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type") || "video/mp4";

    if (contentLength && parseInt(contentLength) > 45 * 1024 * 1024) {
      throw new Error(
        `File too large: ${Math.round(parseInt(contentLength) / 1024 / 1024)}MB. Maximum supported size is 45MB.`,
      );
    }

    const reader = response.body.getReader();
    const chunks = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;
    }

    const blob = new Blob(chunks, { type: contentType });

    if (blob.size < 1024) {
      throw new Error("Video file too small, likely an error response");
    }

    if (blob.size > 45 * 1024 * 1024) {
      // 45MB limit
      throw new Error(
        `File too large: ${Math.round(blob.size / 1024 / 1024)}MB. Maximum supported size is 45MB.`,
      );
    }

    // Convert to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log("Background: Data URL conversion complete");
        resolve(reader.result);
      };
      reader.onerror = () =>
        reject(new Error("Failed to convert blob to data URL"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Background: Fetch failed:", error);
    throw error;
  }
}
