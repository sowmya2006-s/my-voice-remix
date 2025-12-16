import { useState, useEffect } from "react";
import { Server, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface BackendStatusProps {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export function BackendStatus({
  apiUrl,
  setApiUrl,
  isConnected,
  setIsConnected,
}: BackendStatusProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const checkConnection = async (url: string) => {
    setIsChecking(true);
    try {
      const response = await fetch(`${url}/health`, {
        method: "GET",
        mode: "cors",
      });
      
      if (response.ok) {
        setIsConnected(true);
        toast({
          title: "Backend Connected",
          description: "Successfully connected to the voice cloning API.",
        });
        return true;
      }
    } catch {
      // Connection failed
    }
    setIsConnected(false);
    return false;
  };

  const handleSaveUrl = async () => {
    if (!tempUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid backend URL.",
        variant: "destructive",
      });
      return;
    }

    const connected = await checkConnection(tempUrl);
    if (connected) {
      setApiUrl(tempUrl);
      localStorage.setItem("voiceclone_api_url", tempUrl);
    } else {
      toast({
        title: "Connection Failed",
        description: "Could not connect to the backend. Make sure the server is running.",
        variant: "destructive",
      });
    }
    setIsChecking(false);
  };

  useEffect(() => {
    const savedUrl = localStorage.getItem("voiceclone_api_url");
    if (savedUrl) {
      setApiUrl(savedUrl);
      setTempUrl(savedUrl);
      checkConnection(savedUrl).finally(() => setIsChecking(false));
    }
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="glass"
          size="sm"
          className={`gap-2 ${
            isConnected
              ? "border-neon-green/50 text-neon-green"
              : "border-destructive/50 text-destructive"
          }`}
        >
          {isConnected ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <Server className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isConnected ? "Connected" : "Not Connected"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card neon-border">
        <DialogHeader>
          <DialogTitle className="font-display">Backend Configuration</DialogTitle>
          <DialogDescription>
            Connect to your Python FastAPI backend server running RVC and Demucs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="http://localhost:8000"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => checkConnection(tempUrl).finally(() => setIsChecking(false))}
                disabled={isChecking}
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <p className="text-sm font-medium">Setup Instructions:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Clone the backend repository</li>
              <li>Install dependencies: pip install -r requirements.txt</li>
              <li>Run: python main.py</li>
              <li>Enter the URL above (default: http://localhost:8000)</li>
            </ol>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-neon-green" : "bg-destructive"
              }`}
            />
            <span className="text-sm">
              Status:{" "}
              <span className={isConnected ? "text-neon-green" : "text-destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </span>
          </div>

          <Button variant="neon" className="w-full" onClick={handleSaveUrl} disabled={isChecking}>
            {isChecking ? "Connecting..." : "Save & Connect"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
