//import { useState } from "react";
import "./App.css";
import logo from "./assets/clipstream48.png";

function App() {
  //const [streamDetected, setStreamDetected] = useState(false);
  //const [streamer, setStreamer] = useState("");

  const generateClip = async () => {
    try {
      const response = await fetch("http://localhost:3000/generate-clips", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Clip generated:", data);
    } catch (error) {
      console.error("Error generating clip:", error);
    }
  };

  return (
    <>
      <div className="title_box">
        <img src={logo} alt="Logo" />
        <div className="title">ClipStream AI</div>
      </div>
      <div>Capture the best Twitch moments</div>
      <button onClick={generateClip}>Clip last 30 seconds</button>
    </>
  );
}

export default App;
