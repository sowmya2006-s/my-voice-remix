import { useState, useRef } from "react";
import { Music, Link, Upload, X, Youtube, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface SongInputProps {
  onSongReady: (song: { type: "url" | "file"; value: string | File }) => void;
  songData: { type: "url" | "file"; value: string | File } | null;
  setSongData: (data: { type: "url" | "file"; value: string | File } | null) => void;
}

export function SongInput({ onSongReady, songData, setSongData }: SongInputProps) {
  const [url, setUrl] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "file">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidYoutubeUrl = (url: string) => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const isValidAudioUrl = (url: string) => {
    return /^https?:\/\/.+\.(mp3|wav|ogg|m4a|flac)$/i.test(url) || isValidYoutubeUrl(url);
  };

  const handleUrlSubmit = () => {
    if (!url.trim()) {
      toast({
        title: "No URL Provided",
        description: "Please enter a YouTube or audio URL.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAudioUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL or direct audio link.",
        variant: "destructive",
      });
      return;
    }

    setSongData({ type: "url", value: url });
    onSongReady({ type: "url", value: url });
    toast({
      title: "Song URL Added",
      description: isValidYoutubeUrl(url) ? "YouTube link ready for processing" : "Audio URL ready for processing",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/flac", "audio/x-m4a"];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an MP3, WAV, OGG, M4A, or FLAC file.",
          variant: "destructive",
        });
        return;
      }

      setSongData({ type: "file", value: file });
      onSongReady({ type: "file", value: file });
      toast({
        title: "Song Uploaded",
        description: `${file.name} is ready for processing.`,
      });
    }
  };

  const clearSong = () => {
    setSongData(null);
    setUrl("");
  };

  return (
    <Card variant="neon" className="slide-up" style={{ animationDelay: "0.1s" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Music className="w-5 h-5 text-secondary" />
          </div>
          <span className="neon-text-magenta">Song Input</span>
        </CardTitle>
        <CardDescription>
          Paste a YouTube link or upload your song file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
          <Button
            variant={inputMode === "url" ? "default" : "ghost"}
            className={`flex-1 ${inputMode === "url" ? "" : "text-muted-foreground"}`}
            onClick={() => setInputMode("url")}
          >
            <Link className="w-4 h-4 mr-2" />
            URL / YouTube
          </Button>
          <Button
            variant={inputMode === "file" ? "secondary" : "ghost"}
            className={`flex-1 ${inputMode === "file" ? "" : "text-muted-foreground"}`}
            onClick={() => setInputMode("file")}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>

        {/* URL Input */}
        {inputMode === "url" && !songData && (
          <div className="space-y-4 fade-in">
            <div className="relative">
              <Input
                placeholder="Paste YouTube URL or audio link..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-12 h-12 bg-muted/30 border-border focus:border-primary focus:ring-primary"
              />
              {url && isValidYoutubeUrl(url) && (
                <Youtube className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
              )}
            </div>
            <Button
              variant="neon"
              className="w-full"
              onClick={handleUrlSubmit}
              disabled={!url.trim()}
            >
              <Link className="w-4 h-4 mr-2" />
              Add Song from URL
            </Button>
          </div>
        )}

        {/* File Upload */}
        {inputMode === "file" && !songData && (
          <div className="fade-in">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileAudio className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <p className="text-foreground font-medium mb-1">Click to upload song</p>
              <p className="text-sm text-muted-foreground">MP3, WAV, OGG, M4A, FLAC (max 100MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Song Preview */}
        {songData && (
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg neon-border-magenta fade-in">
            {songData.type === "url" ? (
              <div className="p-3 rounded-lg bg-destructive/20">
                <Youtube className="w-6 h-6 text-destructive" />
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-secondary/20">
                <FileAudio className="w-6 h-6 text-secondary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {songData.type === "url"
                  ? (songData.value as string)
                  : (songData.value as File).name}
              </p>
              <p className="text-xs text-muted-foreground">
                {songData.type === "url" ? "YouTube / Audio URL" : "Uploaded File"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={clearSong}>
              <X className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}

        {/* Supported Platforms */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Youtube className="w-3 h-3" /> YouTube
          </span>
          <span>•</span>
          <span>MP3</span>
          <span>•</span>
          <span>WAV</span>
          <span>•</span>
          <span>Any Language</span>
        </div>
      </CardContent>
    </Card>
  );
}
