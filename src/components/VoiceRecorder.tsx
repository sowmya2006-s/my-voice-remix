import { useState, useRef, useEffect } from "react";
import { Mic, Square, Upload, Trash2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onVoiceReady: (audioBlob: Blob) => void;
  voiceFile: Blob | null;
  setVoiceFile: (file: Blob | null) => void;
}

export function VoiceRecorder({ onVoiceReady, voiceFile, setVoiceFile }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyserData, setAnalyserData] = useState<number[]>(new Array(32).fill(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setVoiceFile(audioBlob);
        onVoiceReady(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      const updateAnalyser = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          setAnalyserData(Array.from(dataArray).slice(0, 32));
          animationRef.current = requestAnimationFrame(updateAnalyser);
        }
      };
      updateAnalyser();
      
    } catch (err) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record your voice.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setAnalyserData(new Array(32).fill(0));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an audio file.",
          variant: "destructive",
        });
        return;
      }
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setVoiceFile(file);
      onVoiceReady(file);
      toast({
        title: "Voice Uploaded",
        description: "Your voice sample has been uploaded successfully.",
      });
    }
  };

  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setVoiceFile(null);
    setRecordingTime(0);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card variant="neon" className="slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mic className="w-5 h-5 text-primary" />
          </div>
          <span className="neon-text">Your Voice</span>
        </CardTitle>
        <CardDescription>
          Record or upload at least 30 seconds of clear voice for best results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Waveform Visualizer */}
        <div className="h-24 flex items-center justify-center gap-1 bg-muted/30 rounded-lg p-4">
          {analyserData.map((value, index) => (
            <div
              key={index}
              className="w-2 bg-gradient-to-t from-primary to-secondary rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(4, (value / 255) * 100)}%`,
                opacity: isRecording ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        {/* Recording Time */}
        <div className="text-center">
          <span className="font-display text-4xl font-bold neon-text">
            {formatTime(recordingTime)}
          </span>
          {isRecording && (
            <span className="ml-3 inline-flex items-center gap-2 text-destructive">
              <span className="w-2 h-2 rounded-full bg-destructive recording-pulse" />
              Recording
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <Button
              variant="record"
              size="icon-lg"
              onClick={startRecording}
              disabled={!!voiceFile}
              className="glow-pulse"
            >
              <Mic className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon-lg"
              onClick={stopRecording}
              className="rounded-full border-destructive text-destructive hover:bg-destructive/10"
            >
              <Square className="w-6 h-6" />
            </Button>
          )}

          <span className="text-muted-foreground">or</span>

          <Button
            variant="glass"
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || !!voiceFile}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Audio Preview */}
        {audioUrl && (
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg fade-in">
            <Button variant="outline" size="icon" onClick={togglePlayback}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Voice Sample Ready</p>
              <p className="text-xs text-muted-foreground">Duration: {formatTime(recordingTime)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={clearRecording}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
