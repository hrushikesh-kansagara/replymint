# 🌱 ReplyMint

> Your witty LinkedIn comment co-pilot — powered by Claude AI

ReplyMint is a Chrome extension that helps you craft thoughtful, engaging LinkedIn comments in seconds. Paste any post, pick your tone and angle, and get an AI-generated conversation starter that sounds like *you*.

![ReplyMint Banner](icon128.png)

---

## ✨ Features

- **Smart post analysis** — Pastes any LinkedIn post and gets a punchy TL;DR summary
- **4 comment angles** — Agree & extend, Push back, Personal story, or Add a data point
- **Tone switcher** — Professional, Casual, Curious, or Bold — adjust on the fly
- **Polish tools** — Make your starter shorter, punchier, or more formal with one click
- **Recent activity** — Keeps a history of your last 5 analysed posts
- **Dark mode** — Easy on the eyes
- **Local & private** — Your API key and data never leave your browser

---

## 🖼️ Screenshots

| Setup | Analyse | Results |
|-------|---------|---------|
| Enter your Anthropic API key | Paste a LinkedIn post | Pick an angle & copy |

---

## 🚀 Installation (Developer Mode)

Since this extension isn't on the Chrome Web Store yet, install it manually:

1. **Download or clone this repository**
   ```bash
   git clone https://github.com/hrushikesh-kansagara/replymint.git
   ```

2. **Open Chrome Extensions page**
   - Go to `chrome://extensions/` in your browser

3. **Enable Developer Mode**
   - Toggle the **Developer mode** switch in the top-right corner

4. **Load the extension**
   - Click **"Load unpacked"**
   - Select the folder where you cloned/downloaded this repo

5. **Pin it to your toolbar** *(optional but recommended)*
   - Click the puzzle piece 🧩 icon in Chrome's toolbar
   - Click the pin 📌 next to ReplyMint

---

## 🔑 Getting Your API Key

ReplyMint uses the [Anthropic Claude API](https://console.anthropic.com/).

1. Sign up or log in at [console.anthropic.com](https://console.anthropic.com/)
2. Go to **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)
4. Paste it into ReplyMint on first launch

> Your key is stored **only in your browser's local storage** and is never sent anywhere except directly to Anthropic's API.

---

## 🛠️ How to Use

1. **Open LinkedIn** and find a post you want to reply to
2. **Select and copy** the post text (Ctrl+C / Cmd+C)
3. **Click the ReplyMint icon** 🌱 in your Chrome toolbar
4. **Paste the text** into the input box
5. **Hit "Analyse post ✦"**
6. **Choose your vibe** (tone) and **pick an angle**
7. Optionally **polish** it (shorter / punchier / more formal)
8. **Click "Copy starter ✦"** and paste it into LinkedIn!

---

## 📁 Project Structure

```
replymint/
├── manifest.json       # Extension config (MV3)
├── background.js       # Service worker — handles Claude API calls
├── content.js          # Injected into LinkedIn pages
├── popup.html          # Extension popup UI
├── popup.css           # Styles
├── popup.js            # UI logic
├── icon16.png
├── icon32.png
├── icon48.png
├── icon128.png
└── icon.svg
```

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension | Chrome Manifest V3 |
| AI | Anthropic Claude (`claude-sonnet-4-5`) |
| UI | Vanilla HTML/CSS/JS |
| Storage | Chrome Local Storage |
| Font | Inter (Google Fonts) |

---

## ⚙️ Permissions Used

| Permission | Why |
|-----------|-----|
| `activeTab` | Read the current tab |
| `storage` | Save your API key and history locally |
| `scripting` | Extract post text from LinkedIn pages |
| `tabs` | Find open LinkedIn tabs |

---

## 🔒 Privacy

- Your API key is stored **locally** in Chrome's storage — never on any server
- Post text you analyse is sent **only** to Anthropic's API for processing
- No analytics, no tracking, no data collection

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork this repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

### Ideas for contributions
- [ ] Auto-detect post text without copy-paste
- [ ] Support for Twitter/X posts
- [ ] Custom tone/angle templates
- [ ] Export history to CSV
- [ ] Chrome Web Store listing

---

## 📝 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- Built with [Anthropic Claude](https://anthropic.com)
- Inspired by every person who's stared at a LinkedIn post wondering what to say

---

*Made with 🌱 and a bit of wit*
