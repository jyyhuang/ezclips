<h1 align="center">
  <img src="https://raw.githubusercontent.com/jyyhuang/ezclips/refs/heads/main/extension/public/clipstream128.png" alt="ezclips">

  Ezclips
</h1>

<p align="center">
  <strong>A Chrome extension that streamlines uploading Twitch clips to TikTok by automating the injection process.</strong>
</p>

## 🎯 Features
- **Gathers Top Clips**: Retrieves top clips from any Twitch streamer through the Twitch API
- **Auto-Injection**: Automatically injects video files into Tiktok's upload form
- **Preview**: Watch clips before downloading or uploading
- **Bulk Download**: Download individual clips or all at once
- **Smart Upload**: Batch upload with anti-bot-detection delays

## 🚀 Installation
### Prerequisites
- Chromium based browser
### Steps

1. **Clone this repository**
     ```bash
     git clone https://github.com/jyyhuang/ezclips.git
     cd ezclips
     ```

2. **Load the extension in Chrome**
     - Open Chrome and navigate to `chrome://extensions/`
     - Enable **Developer mode** (toggle in top-right corner)
     - Click **Load unpacked**
     - Select the `extension` directory containing `manifest.json`

3. **Verify installation**
     - The Ezclips icon should appear in your Chrome toolbar
     - Click the icon to open the extension popup
     - Check that there are no errors on the extensions page

## 💻 Usage
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

> **Note**: TikTok tabs will open in the background. You may need to manually add captions, hashtags, and finalize the upload on each tab.

## Best Practices

### Avoiding TikTok Blocks

TikTok has sophisticated bot detection that can temporarily block your access. Recommendations:

**Upload in Small Batches**
- 1-3 clips at a time (safest)
- 4-5 clips (moderate risk)

#### ⚠️ If You Get Blocked

If you see this error:
```
Access Denied
You don't have permission to access "http://www.tiktok.com/upload?"
Reference #18.xxxxxxxx.xxxxxxxxxx.xxxxxxxx
```
**Recovery steps:**
- Wait 10-30 minutes (or longer for repeated blocks)
- Clear TikTok cookies
- Try incognito mode
- Switch networks

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Better file input detection for TikTok UI changes
- Support for larger files (chunking/streaming)
- More sophisticated anti-bot-detection techniques
- Queue management for large batch uploads
- Progress indicators in extension popup
- AI editing features (auto-captions, clip trimming)
- Support for other platforms (YouTube Shorts, Instagram Reels)

## 📮 Support
For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions

---

<p align="center">
  <strong>⚠️ Disclaimer</strong><br>
  This extension automates uploads to TikTok. Ensure you comply with TikTok's Terms of Service and use responsibly. Excessive automation may result in temporary or permanent account restrictions. The developers are not responsible for any account actions taken by TikTok.
</p>

