import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

interface ResultPlayerProps {
  audioUrl: string | null;
  onReset: () => void;
}

export function ResultPlayer({ audioUrl, onReset }: ResultPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = "voice-cloned-song.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Started",
        description: "Your song is being downloaded.",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && audioUrl) {
      try {
        await navigator.share({
          title: "My Voice Cloned Song",
          text: "Check out this song with my cloned voice!",
          url: window.location.href,
        });
      } catch {
        toast({
          title: "Share Link Copied",
          description: "Link copied to clipboard!",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard!",
      });
    }
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <Card variant="neon" className="slide-up overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20">
            <Volume2 className="w-5 h-5 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Song is Ready!
          </span>
        </CardTitle>
        <CardDescription>Listen to your voice-cloned masterpiece</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Waveform Visualization (Static) */}
        <div className="h-20 flex items-center justify-center gap-[2px] px-4">
          {Array.from({ length: 60 }).map((_, i) => {
            const height = Math.sin((i / 60) * Math.PI * 4) * 30 + 40 + Math.random() * 20;
            const isActive = (currentTime / duration) * 60 > i;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-t from-primary to-secondary"
                    : "bg-muted/50"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Time & Seek */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>

          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={(v) => setVolume(v[0])}
            className="w-24"
          />

          <Button
            variant="neon"
            size="icon-lg"
            onClick={togglePlay}
            className="rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download MP3
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Song
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground">
          For personal use only. Do not redistribute copyrighted content.
        </p>
      </CardContent>
    </Card>
  );
}
