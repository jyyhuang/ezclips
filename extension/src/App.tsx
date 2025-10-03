import { useState } from "react";
import "./App.css";
import logo from "./assets/clipstream48.png";
import Clips from "./components/Clips";
import ClipForm from "./components/ClipForm";
import { type Clip } from "./interfaces/clip";

function App() {
  const [streamer, setStreamer] = useState("");
  const [days, setDays] = useState<number | null>();
  const [amount, setAmount] = useState<number | null>();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Failed to download file.");
    }
  };

  const generateClip = async (e: React.FormEvent) => {
    e.preventDefault();
    setClips([]);
    setError(null);
    setLoading(true);
    if (streamer.trim() === "") {
      setError("Streamer name is required.");
      setLoading(false);
      return;
    }

    const safeDays = Math.min(Math.max(days ?? 1, 1), 7);
    const safeAmount = Math.min(Math.max(amount ?? 1, 1), 5);

    try {
      const response = await fetch(
        `http://localhost:3000/generate-clips?streamer=${encodeURIComponent(
          streamer,
        )}&days=${encodeURIComponent(safeDays)}&amount=${encodeURIComponent(safeAmount)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.clips || data.clips.length === 0) {
        setError("No clips found for this streamer.");
      } else {
        setClips(data.clips);
      }
    } catch (error) {
      console.error("Error generating clip:", error);
      setError("Failed to fetch clips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="title_box">
        <img src={logo} alt="Logo" />
        <div className="title">ezClips</div>
      </div>
      <div className="caption">Capture the best Twitch moments</div>

      <ClipForm
        streamer={streamer}
        days={days ?? null}
        amount={amount ?? null}
        setStreamer={setStreamer}
        setDays={setDays}
        setAmount={setAmount}
        onSubmit={generateClip}
      />

      <Clips
        clips={clips}
        downloadFile={downloadFile}
        loading={loading}
        error={error}
      />
    </>
  );
}

export default App;
