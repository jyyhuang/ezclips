import React from "react";
import "./ClipsForm.css";

interface ClipFormProps {
  streamer: string;
  days: number | null;
  amount: number | null;
  setStreamer: (value: string) => void;
  setDays: (value: number | null) => void;
  setAmount: (value: number | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ClipForm: React.FC<ClipFormProps> = ({
  streamer,
  days,
  amount,
  setStreamer,
  setDays,
  setAmount,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label htmlFor="streamer">Name</label>
        <input
          id="streamer"
          type="text"
          value={streamer}
          onChange={(e) => setStreamer(e.target.value)}
          placeholder="Enter a twitch streamer"
          className="input_streamer"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="days">Past Days (1–7)</label>
        <input
          id="days"
          type="number"
          value={days ?? ""}
          min={1}
          max={7}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setDays(null);
            } else {
              let num = Number(val);
              if (num < 1) num = 1;
              if (num > 7) num = 7;
              setDays(num);
            }
          }}
          placeholder="Days"
          className="input_days"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount (1–5)</label>
        <input
          type="number"
          value={amount ?? ""}
          min={1}
          max={5}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setAmount(null);
            } else {
              let num = Number(val);
              if (num < 1) num = 1;
              if (num > 5) num = 5;
              setAmount(num);
            }
          }}
          placeholder="Amount"
          className="input_amount"
          required
        />
      </div>

      <button
        type="submit"
        className="download_button"
        disabled={streamer.trim() === "" || days === null || amount === null}
      >
        Get Clips
      </button>
    </form>
  );
};

export default ClipForm;
