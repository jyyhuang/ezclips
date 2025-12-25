<h1 align="center">
  <img src="https://raw.githubusercontent.com/jyyhuang/ezclips/refs/heads/main/extension/public/ezclips128.png" alt="ezclips">

Ezclips

</h1>

<p align="center">
  <strong>A Chrome extension that extracts and uploads Twitch clips to TikTok by automating the injection process.</strong>
</p>

## Features

- **Gathers Top Clips**: Retrieves top clips from any Twitch streamer through the Twitch API
- **Auto-Injection**: Automatically injects video files into Tiktok's upload form
- **Preview**: Watch clips before downloading or uploading
- **Bulk Download**: Download individual clips or all at once

## Installation

As of now, the extension has not been uploaded to the chrome web store and requires manual installation.

### Prerequisites

- Chromium based browser

### Steps

1. **Clone this repository**

   ```bash
   git clone https://github.com/jyyhuang/ezclips.git
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `dist` directory containing `manifest.json`

3. **Verify installation**
   - The Ezclips icon should appear in your Chrome toolbar
   - Click the icon to open the extension popup
   - Check that there are no errors on the extensions page

## Usage

### Step 1: Find Clips

1. Click the Ezclips extension icon in your Chrome toolbar
2. Enter the following information:
   - **Streamer name**: The Twitch username (e.g., "xqc", "kaicenat")
   - **Past days**: How far back to search for clips (1-7 days)
   - **Number of clips**: How many clips to retrieve (1-5)
3. Click **"Get Clips"** to fetch the top clips

### Step 2: Preview & Select

- **Preview**: Click the play button on any clip to watch it
- **Select**: Choose which clips you want to upload by checking the boxes
- All clips are sorted by view count (most popular first)

### Step 3: Download or Upload

#### Option A: Download

- **Download individual clips**: Click the "Download" button on any clip
- **Download all**: Click "Download All" to save all clips to your computer

#### Option B: Upload to TikTok

1. Click **"Upload to TikTok"**
2. Select the clips you want to upload using checkboxes
3. Click **"Upload Selected"**
4. The extension will:
   - Store clip data temporarily in Chrome storage
   - Open TikTok upload pages in new tabs (with smart delays)
   - Automatically inject video files into TikTok's upload form
   - Clean up storage after successful injection

> **Note**: TikTok tabs will open in the background, but you may need to click on them for the scripts to run. You may also need to manually add captions, hashtags, and finalize the upload on each tab.

## Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing issues for solutions

---

<p align="center">
  <strong>⚠️ Disclaimer</strong><br>
  This extension automates uploads to TikTok. Ensure you comply with TikTok's Terms of Service and use responsibly. Excessive automation may result in temporary or permanent account restrictions. The developers are not responsible for any account actions taken by TikTok.
</p>
