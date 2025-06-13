# 🎙️ Transcriptie- en Vertaal-API

Een Node.js backend die:

* Audio extraheert uit YouTube-links of uploads
* Audio converteert naar WAV
* Transcribeert via Python-script (`transcribe.py`)
* Tekst vertaalt via Ollama AI (`/translate/mistral`)
* Spellingscontrole uitvoert via Qwen model (`/spelling/qwen`)

---

## ✅ Vereisten

### Software

* **Node.js** (versie 18+ aanbevolen)
* **Python 3.x**
* **ffmpeg** (moet beschikbaar zijn in het PATH)
* **yt-dlp.exe** (geplaatst in `/bin` map)
* **Python-dependencies** voor transcriptie (bijv. `whisper`, afhankelijk van `transcribe.py`)

### Bestanden

* `transcribe.py` — Python script voor transcriptie
* `validateApiKey.cjs` — Middelware voor API-sleutels
* `JWT_Token0.js` — JWT validatie middleware
* `yt-dlp.exe` — in `bin/` directory

---

## 🛠️ Installatie

### 1. Clone de repository

```bash
git clone <REPO_URL>
cd <project-map>
```

### 2. Installeer Node.js dependencies

```bash
npm install
```

### 3. Installeer Python dependencies

Installeer OpenAI-whisper:

```bash
pip install openai-whisper
```

### 4. Zorg dat `ffmpeg` beschikbaar is

Op macOS:

```bash
brew install ffmpeg
```

Op Ubuntu:

```bash
sudo apt install ffmpeg
```

Op Windows: download van [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html) en voeg toe aan je systeem-PATH.

### 5. Plaats `yt-dlp.exe`

Plaats het bestand in de `bin/` map:

```
/bin/yt-dlp.exe
```

(Download vanaf: [https://github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases))

---

## 📁 Mappenstructuur

```
/routes
  /bin
    └── yt-dlp.exe
  └── post_router.js
  └── validateApiKey.cjs
  └── JWT_Token0.js
/uploads
  └── (tijdelijke bestanden)
transcribe.py
server.js
```

---

## 🚀 Gebruik

Start de server:

```bash
node server.js
```
of
```bash
npm start
```

---

## 🔌 API-routes

### POST `/transcribe/link`

Download en transcribeert audio van een YouTube-link.

**Body (JSON)**:

```json
{
  "videoUrl": "https://www.youtube.com/watch?v=XXXX"
}
```

### POST `/transcribe`

Upload een audiobestand voor transcriptie.

**Form-data**:

* `audio`: audiobestand (bijv. MP3, M4A)

### POST `/translate/mistral`

Vertaal een array van zinnen.

**Body**:

```json
{
  "text": ["Hallo, hoe gaat het?", "Nog een zin"],
  "to": "English"
}
```

### POST `/spelling/qwen`

Voert spellingscontrole uit op transcriptiechunks.

**Body**:

```json
{
  "text": ["Dit is een test", "Nog een zin met spelingfout"]
}
```

---
