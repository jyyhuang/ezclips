chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_VIDEO") {
    // Handle the fetch and keep the service worker alive
    handleVideoFetch(request.url)
      .then((dataUrl) => {
        console.log("Background: Successfully fetched video, sending response");
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

let keepAliveInterval;

function keepServiceWorkerAlive() {
  // Clear any existing interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  // Ping every 20 seconds to keep service worker alive
  keepAliveInterval = setInterval(() => {
    console.log("Background: Keeping service worker alive");
  }, 20000);
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

async function handleVideoFetch(url) {
  keepServiceWorkerAlive();

  try {
    console.log("Background: Starting fetch for", url);
    const dataUrl = await fetchVideoAsDataUrl(url);
    console.log("Background: Fetch completed successfully");
    return dataUrl;
  } finally {
    stopKeepAlive();
  }
}

async function fetchVideoAsDataUrl(url) {
  try {
    console.log("Background: Fetching video from", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "video/*,*/*",
        "Cache-Control": "no-cache",
        "User-Agent": "Mozilla/5.0 (compatible; TikTokUploader/1.0)",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type") || "video/mp4";

    console.log("Background: Response headers:", {
      contentLength,
      contentType,
    });

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

      if (receivedLength % (1024 * 1024) < value.length) {
        console.log(`Background: Download progress: ${receivedLength} bytes`);
      }
    }

    const blob = new Blob(chunks, { type: contentType });
    console.log("Background: Downloaded blob size:", blob.size, "bytes");

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
    console.log("Background: Converting to data URL...");
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
