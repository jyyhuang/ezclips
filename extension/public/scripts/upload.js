async function clearStorage() {
  try {
    if (chrome && chrome.storage && chrome.storage.local) {
      await new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            console.error("Error clearing storage:", chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else {
      console.warn("Chrome storage not available for cleanup");
    }
  } catch (error) {
    console.error("Failed to clear storage:", error);
  }
}

function waitForFileInput(callback) {
  const selectors = [
    'input[type="file"][accept*="video"]',
    'input[type="file"][accept*="mp4"]',
    'input[type="file"]',
    '[data-testid*="upload"] input[type="file"]',
    '.upload input[type="file"]',
    '[data-e2e="upload-btn"] input[type="file"]',
  ];

  function findInput() {
    for (const selector of selectors) {
      const input = document.querySelector(selector);
      if (input && !input.disabled) {
        return input;
      }
    }
    return null;
  }

  const input = findInput();
  if (input) {
    setTimeout(() => callback(input), 100);
    return;
  }

  console.log("No file input found, waiting...");
  const observer = new MutationObserver(() => {
    const input = findInput();
    if (input) {
      observer.disconnect();
      setTimeout(() => callback(input), 100);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Timeout after 30 seconds
  setTimeout(() => {
    observer.disconnect();
    console.error("Timeout: Could not find file input after 30 seconds");
  }, 30000);
}

async function fetchVideo(url, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Content: Requesting video fetch from background script (attempt ${attempt}/${maxRetries})`,
      );

      const response = await chrome.runtime.sendMessage({
        type: "FETCH_VIDEO",
        url,
      });

      if (!response) {
        throw new Error("No response from background script");
      }

      if (!response.success) {
        throw new Error(`Background fetch failed: ${response.error}`);
      }

      return response.dataUrl;
    } catch (error) {
      console.error(`Fetch attempt ${attempt} failed:`, error);

      if (
        error.message.includes("File too large") ||
        error.message.includes("Extension context invalidated")
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      console.log(`Retrying in ${attempt * 3} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
    }
  }
}

// Convert data URL to File object
function dataUrlToFile(dataUrl, filename) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

(async function () {
  // Check if this is a TikTok upload page
  const isTikTokUpload =
    window.location.href.includes("/upload") ||
    window.location.href.includes("/tiktokstudio/upload");

  if (!isTikTokUpload) {
    console.log("Not a TikTok upload page, exiting");
    await clearStorage();
    return;
  }

  // Wait for page to be fully loaded
  if (document.readyState !== "complete") {
    await new Promise((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", resolve);
      } else {
        window.addEventListener("load", resolve);
      }
    });
  }

  // Add additional delay for TikTok's dynamic content
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const urlParams = new URLSearchParams(window.location.search);
  const clipId = urlParams.get("clipId");

  if (!clipId) {
    console.log("No clipId found in URL");
    await clearStorage();
    return;
  }

  const key = `tiktok_upload_${clipId}`;

  try {
    if (!chrome || !chrome.storage || !chrome.storage.local) {
      throw new Error(
        "Chrome storage API not available. Extension may need to be reloaded.",
      );
    }

    const result = await new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(key, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        clearStorage();
        reject(new Error(`Storage access failed: ${error.message}`));
      }
    });

    const clipData = result[key];
    if (!clipData) {
      console.error("No clip data found for", key);
      await clearStorage();
      return;
    }

    try {
      console.log("Content: Starting video download...");

      const dataUrl = await fetchVideo(clipData.videoUrl);

      const file = dataUrlToFile(dataUrl, clipData.filename || "clip.mp4");

      // Wait for TikTok file input
      waitForFileInput((input) => {
        try {
          const dt = new DataTransfer();
          dt.items.add(file);

          input.files = dt.files;

          input.focus();

          const events = [
            { event: "focus", delay: 0 },
            { event: "input", delay: 50 },
            { event: "change", delay: 100 },
            { event: "blur", delay: 200 },
          ];

          events.forEach(({ event, delay }) => {
            setTimeout(() => {
              input.dispatchEvent(
                new Event(event, { bubbles: true, cancelable: true }),
              );
            }, delay);
          });

          console.log("File injection completed");

          // Cleanup storage after successful injection with better error handling
          setTimeout(() => {
            try {
              if (chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.remove(key, () => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "Error removing storage:",
                      chrome.runtime.lastError,
                    );
                  } else {
                    console.log("Removed cached clip:", key);
                  }
                });
              } else {
                console.warn("Chrome storage not available for cleanup");
              }
            } catch (cleanupError) {
              clearStorage();
              console.error("Storage cleanup failed:", cleanupError);
            }
          }, 2000);
        } catch (injectionError) {
          clearStorage();
          console.error("File injection failed:", injectionError);
        }
      });
    } catch (fetchError) {
      console.error("Failed to fetch video:", fetchError);
      await clearStorage();

      if (fetchError.message.includes("File too large")) {
        alert(
          `Error: ${fetchError.message}\n\nTry downloading the video manually and uploading it directly to TikTok.`,
        );
      } else {
        alert(
          `Failed to download video: ${fetchError.message}\n\nTry refreshing the page or check your internet connection.`,
        );
      }
    }
  } catch (storageError) {
    console.error("Storage access failed:", storageError);
    await clearStorage();
  }
})();
