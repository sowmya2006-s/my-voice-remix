# Voice Clone Backend - Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **FFmpeg** (required for audio processing)
- **GPU with CUDA** (recommended for RVC)
- **8GB+ RAM**

### Step 1: Install FFmpeg

**Windows:**
```bash
winget install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install ffmpeg
```

### Step 2: Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Install PyTorch with CUDA (GPU)

```bash
# For CUDA 11.8
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118

# For CUDA 12.1
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121

# For CPU only (slower)
pip install torch torchaudio
```

### Step 5: Install RVC

Option A - Use RVC-Project (recommended):
```bash
git clone https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git rvc
cd rvc
pip install -r requirements.txt
```

Option B - Use so-vits-svc or other alternatives

### Step 6: Run the Server

```bash
python main.py
```

The server will start at: **http://localhost:8000**

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health + GPU status |
| `/upload-voice` | POST | Upload voice sample (webm/wav) |
| `/song-from-link` | POST | Download from YouTube URL |
| `/upload-song` | POST | Upload song file |
| `/train-voice` | POST | Prepare voice model |
| `/convert-song` | POST | Run full conversion pipeline |
| `/result` | GET | Download final MP3 |

---

## 🎵 Processing Pipeline

1. **Upload Voice** → User records/uploads voice sample
2. **Get Song** → Download from YouTube or upload file
3. **Separate** → Demucs extracts vocals + instrumental
4. **Convert** → RVC transforms vocals to user's voice
5. **Merge** → FFmpeg combines new vocals + instrumental
6. **Export** → High-quality MP3 output

---

## ⚠️ Troubleshooting

### "yt-dlp not found"
```bash
pip install yt-dlp
```

### "Demucs failed"
```bash
pip install demucs
# Or try: pip install -U demucs
```

### "CUDA out of memory"
- Reduce audio length
- Use CPU mode (slower but works)

### "FFmpeg not found"
- Ensure FFmpeg is installed and in PATH
- Restart terminal after installing

---

## 🔧 Configuration

Edit `main.py` to change:
- Port (default: 8000)
- Upload directories
- Audio quality settings

---

## 📌 Notes

- First run downloads Demucs models (~1GB)
- GPU processing is 10x faster than CPU
- Supports any language (Tamil, Hindi, English, etc.)
- For personal/demo use only

---

## 🖥️ Connect to Frontend

1. Start this backend: `python main.py`
2. Open the frontend in browser
3. Click "Connect" in Backend Status
4. Enter: `http://localhost:8000`
5. Start cloning!
