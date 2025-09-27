import React, { useState } from "react";
import { type Clip } from "../interfaces/clip";
import "./Clips.css";

interface ClipsProps {
  clips: Clip[];
  downloadFile: (url: string, filename: string) => void;
  loading: boolean;
  error: string | null;
  streamer: string;
}

const Clips: React.FC<ClipsProps> = ({
  clips,
  downloadFile,
  loading,
  error,
  streamer,
}) => {
  const [selecting, setSelecting] = useState(false);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const toggleClip = (id: string) => {
    setSelectedClips((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleUploadSelected = async () => {
    const clipsToUpload = clips.filter((c) => selectedClips.includes(c.id));

    if (clipsToUpload.length === 0) {
      alert("Please select at least one clip to upload.");
      return;
    }

    setUploading(true);

    try {
      // Check if chrome.tabs is available
      if (typeof chrome !== "undefined" && chrome.tabs) {
        for (let i = 0; i < clipsToUpload.length; i++) {
          const clip = clipsToUpload[i];

          console.log(
            `Processing clip ${i + 1}/${clipsToUpload.length}: ${clip.title}`,
          );

          // Store clip data in chrome storage
          try {
            await new Promise<void>((resolve, reject) => {
              chrome.storage.local.set(
                {
                  [`tiktok_upload_${clip.id}`]: {
                    videoUrl: clip.mp4Url,
                    caption: clip.title,
                    filename: clip.filename,
                    tags: `#${streamer} #fyp`,
                  },
                },
                () => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve();
                  }
                },
              );
            });

            await new Promise<void>((resolve, reject) => {
              chrome.tabs.create(
                {
                  url: `https://www.tiktok.com/upload?clipId=${encodeURIComponent(clip.id)}`,
                  active: false,
                },
                (tab) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    console.log(`Created tab for clip: ${clip.title}`, tab?.id);
                    resolve();
                  }
                },
              );
            });

            // Add delay between tab creations
            if (i < clipsToUpload.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
            }
          } catch (error) {
            console.error(`Failed to process clip ${clip.title}:`, error);
            alert(
              `Failed to process clip "${clip.title}": ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
      } else {
        clipsToUpload.forEach((clip, index) => {
          setTimeout(() => {
            window.open(
              `https://www.tiktok.com/upload?clipId=${clip.id}`,
              "_blank",
            );
          }, index * 500); // 500ms delay between each tab
        });
      }
    } catch (error) {
      console.error("Upload process failed:", error);
      alert(
        `Upload process failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setUploading(false);
      setSelecting(false);
      setSelectedClips([]);
    }
  };

  return (
    <div id="clips" className="clips_container">
      {loading && <p className="loading_msg">Fetching clips…</p>}
      {error && <p className="error_msg">{error}</p>}
      {!loading &&
        !error &&
        (clips.length > 0 ? (
          <>
            <button
              onClick={() => {
                clips.forEach((clip) =>
                  downloadFile(clip.mp4Url, clip.filename),
                );
              }}
              disabled={uploading}
            >
              Download All
            </button>
            <button
              type="button"
              onClick={() => setSelecting(true)}
              disabled={uploading}
            >
              Upload to TikTok
            </button>

            {selecting && (
              <div className="upload_selector">
                <h4>Select clips to upload</h4>
                <div className="upload_container">
                  <div className="upload_boxes">
                    {clips.map((clip) => (
                      <label key={clip.id}>
                        <input
                          type="checkbox"
                          checked={selectedClips.includes(clip.id)}
                          onChange={() => toggleClip(clip.id)}
                          disabled={uploading}
                        />
                        {clip.title}
                      </label>
                    ))}
                  </div>
                  <div className="upload_buttons">
                    <button
                      onClick={handleUploadSelected}
                      disabled={uploading || selectedClips.length === 0}
                    >
                      {uploading
                        ? "Uploading..."
                        : `Upload Selected (${selectedClips.length})`}
                    </button>
                    <button
                      onClick={() => setSelecting(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {clips.map((clip) => (
              <div key={clip.id} className="clip_card">
                <h3>{clip.title}</h3>
                <button
                  onClick={() => downloadFile(clip.mp4Url, clip.filename)}
                  className="download_button"
                  disabled={uploading}
                >
                  Download
                </button>
                <video
                  src={clip.mp4Url}
                  poster={clip.thumbnailUrl}
                  controls
                  width="320"
                />
              </div>
            ))}
          </>
        ) : (
          <p>No clips yet</p>
        ))}
    </div>
  );
};

export default Clips;
