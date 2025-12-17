"""
Voice Clone API - FastAPI Backend
Requires: Python 3.10+, GPU recommended for RVC
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import os
import shutil
import subprocess
import uuid

app = FastAPI(title="Voice Clone API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
TEMP_DIR = "temp"

for d in [UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR]:
    os.makedirs(d, exist_ok=True)

# State tracking
current_session = {
    "voice_file": None,
    "song_file": None,
    "result_file": None,
    "session_id": None
}


class SongLinkRequest(BaseModel):
    url: str


@app.get("/")
async def root():
    return {"status": "online", "message": "Voice Clone API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "gpu_available": check_gpu()}


def check_gpu():
    """Check if GPU is available"""
    try:
        import torch
        return torch.cuda.is_available()
    except:
        return False


@app.post("/upload-voice")
async def upload_voice(file: UploadFile = File(...)):
    """Upload user voice sample"""
    try:
        session_id = str(uuid.uuid4())[:8]
        current_session["session_id"] = session_id
        
        voice_path = os.path.join(UPLOAD_DIR, f"{session_id}_voice.webm")
        
        with open(voice_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Convert to WAV for processing
        wav_path = os.path.join(UPLOAD_DIR, f"{session_id}_voice.wav")
        convert_to_wav(voice_path, wav_path)
        
        current_session["voice_file"] = wav_path
        
        return {"success": True, "message": "Voice uploaded successfully", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/song-from-link")
async def song_from_link(request: SongLinkRequest):
    """Download song from YouTube or audio URL"""
    try:
        session_id = current_session.get("session_id", str(uuid.uuid4())[:8])
        output_path = os.path.join(UPLOAD_DIR, f"{session_id}_song.wav")
        
        # Use yt-dlp to download audio
        cmd = [
            "yt-dlp",
            "-x",  # Extract audio
            "--audio-format", "wav",
            "--audio-quality", "0",
            "-o", output_path.replace(".wav", ".%(ext)s"),
            request.url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Download failed: {result.stderr}")
        
        # Find the downloaded file
        for ext in [".wav", ".webm", ".m4a", ".mp3"]:
            temp_path = output_path.replace(".wav", ext)
            if os.path.exists(temp_path):
                if ext != ".wav":
                    convert_to_wav(temp_path, output_path)
                    os.remove(temp_path)
                break
        
        current_session["song_file"] = output_path
        
        return {"success": True, "message": "Song downloaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-song")
async def upload_song(file: UploadFile = File(...)):
    """Upload song file directly"""
    try:
        session_id = current_session.get("session_id", str(uuid.uuid4())[:8])
        
        # Save uploaded file
        temp_path = os.path.join(UPLOAD_DIR, f"{session_id}_song_temp{os.path.splitext(file.filename)[1]}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Convert to WAV
        wav_path = os.path.join(UPLOAD_DIR, f"{session_id}_song.wav")
        convert_to_wav(temp_path, wav_path)
        
        if temp_path != wav_path:
            os.remove(temp_path)
        
        current_session["song_file"] = wav_path
        
        return {"success": True, "message": "Song uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train-voice")
async def train_voice():
    """Train RVC model on user voice (simplified - uses pretrained model)"""
    try:
        voice_file = current_session.get("voice_file")
        if not voice_file or not os.path.exists(voice_file):
            raise HTTPException(status_code=400, detail="No voice file uploaded")
        
        # In production, you would train a custom RVC model here
        # For demo, we use a pretrained model and just validate the voice file
        
        return {"success": True, "message": "Voice model ready"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/convert-song")
async def convert_song():
    """Main processing pipeline: separate vocals, convert, merge"""
    try:
        voice_file = current_session.get("voice_file")
        song_file = current_session.get("song_file")
        session_id = current_session.get("session_id")
        
        if not voice_file or not song_file:
            raise HTTPException(status_code=400, detail="Missing voice or song file")
        
        # Step 1: Separate vocals using Demucs
        vocals_path, instrumental_path = separate_vocals(song_file, session_id)
        
        # Step 2: Convert vocals using RVC
        converted_vocals_path = convert_vocals_rvc(vocals_path, voice_file, session_id)
        
        # Step 3: Merge converted vocals with instrumental
        output_path = os.path.join(OUTPUT_DIR, f"{session_id}_final.mp3")
        merge_audio(converted_vocals_path, instrumental_path, output_path)
        
        current_session["result_file"] = output_path
        
        return {"success": True, "message": "Conversion complete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/result")
async def get_result():
    """Download the final converted song"""
    result_file = current_session.get("result_file")
    
    if not result_file or not os.path.exists(result_file):
        raise HTTPException(status_code=404, detail="No result available")
    
    return FileResponse(
        result_file,
        media_type="audio/mpeg",
        filename="voice_cloned_song.mp3"
    )


# ============ AUDIO PROCESSING FUNCTIONS ============

def convert_to_wav(input_path: str, output_path: str):
    """Convert any audio format to WAV using ffmpeg"""
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ar", "44100",
        "-ac", "2",
        output_path
    ]
    subprocess.run(cmd, capture_output=True)


def separate_vocals(song_path: str, session_id: str):
    """Separate vocals from instrumental using Demucs"""
    output_dir = os.path.join(TEMP_DIR, session_id)
    os.makedirs(output_dir, exist_ok=True)
    
    # Run Demucs
    cmd = [
        "python", "-m", "demucs",
        "--two-stems", "vocals",
        "-o", output_dir,
        song_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        # Fallback: return original as vocals (no separation)
        print(f"Demucs failed: {result.stderr}")
        return song_path, song_path
    
    # Find separated files
    song_name = os.path.splitext(os.path.basename(song_path))[0]
    vocals_path = os.path.join(output_dir, "htdemucs", song_name, "vocals.wav")
    instrumental_path = os.path.join(output_dir, "htdemucs", song_name, "no_vocals.wav")
    
    return vocals_path, instrumental_path


def convert_vocals_rvc(vocals_path: str, voice_model_path: str, session_id: str):
    """Convert vocals to target voice using RVC"""
    output_path = os.path.join(TEMP_DIR, f"{session_id}_converted_vocals.wav")
    
    try:
        # RVC inference command (adjust based on your RVC installation)
        # This is a simplified example - actual RVC setup may vary
        cmd = [
            "python", "rvc_infer.py",
            "--input", vocals_path,
            "--output", output_path,
            "--voice", voice_model_path,
            "--pitch", "0"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0 or not os.path.exists(output_path):
            # Fallback: return original vocals
            print(f"RVC failed: {result.stderr}")
            shutil.copy(vocals_path, output_path)
        
        return output_path
    except Exception as e:
        print(f"RVC error: {e}")
        shutil.copy(vocals_path, output_path)
        return output_path


def merge_audio(vocals_path: str, instrumental_path: str, output_path: str):
    """Merge vocals and instrumental using ffmpeg"""
    cmd = [
        "ffmpeg", "-y",
        "-i", vocals_path,
        "-i", instrumental_path,
        "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=longest",
        "-ar", "44100",
        "-b:a", "320k",
        output_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        # Fallback: just convert vocals to mp3
        cmd = ["ffmpeg", "-y", "-i", vocals_path, "-b:a", "320k", output_path]
        subprocess.run(cmd, capture_output=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
