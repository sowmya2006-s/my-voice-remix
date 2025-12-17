import { useState, useEffect } from "react";
import { Sparkles, Zap, Globe, Shield, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { SongInput } from "@/components/SongInput";
import { ProcessingPipeline } from "@/components/ProcessingPipeline";
import { ResultPlayer } from "@/components/ResultPlayer";
import { ConsentDialog } from "@/components/ConsentDialog";
import { BackendStatus } from "@/components/BackendStatus";
import { SetupWizard } from "@/components/SetupWizard";
import { Button } from "@/components/ui/button";
import { useVoiceClone } from "@/hooks/useVoiceClone";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [showConsent, setShowConsent] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");
  const [isConnected, setIsConnected] = useState(false);
  
  const [voiceFile, setVoiceFile] = useState<Blob | null>(null);
  const [songData, setSongData] = useState<{ type: "url" | "file"; value: string | File } | null>(null);

  const { isProcessing, currentStep, error, resultUrl, processVoiceClone, reset } = useVoiceClone({ apiUrl });

  useEffect(() => {
    const consent = localStorage.getItem("voiceclone_consent");
    if (consent === "true") {
      setHasConsented(true);
      setShowConsent(false);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem("voiceclone_consent", "true");
    setHasConsented(true);
    setShowConsent(false);
    toast({
      title: "Welcome!",
      description: "You can now use the voice cloning feature.",
    });
  };

  const handleDecline = () => {
    toast({
      title: "Access Denied",
      description: "You must accept the terms to use this app.",
      variant: "destructive",
    });
  };

  const handleStartProcessing = async () => {
    if (!voiceFile) {
      toast({
        title: "Voice Required",
        description: "Please record or upload your voice first.",
        variant: "destructive",
      });
      return;
    }

    if (!songData) {
      toast({
        title: "Song Required",
        description: "Please provide a song URL or upload a file.",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Backend Not Connected",
        description: "Please connect to the backend server first.",
        variant: "destructive",
      });
      return;
    }

    await processVoiceClone(voiceFile, songData);
  };

  const handleReset = () => {
    reset();
    setVoiceFile(null);
    setSongData(null);
  };

  const isReadyToProcess = voiceFile && songData && !isProcessing;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <ConsentDialog
        open={showConsent && !hasConsented}
        onAccept={handleConsent}
        onDecline={handleDecline}
      />

      {showSetupWizard && (
        <SetupWizard
          apiUrl={apiUrl}
          onClose={() => setShowSetupWizard(false)}
          onComplete={() => {
            setShowSetupWizard(false);
            setIsConnected(true);
          }}
        />
      )}

      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary mb-6 neon-border">
            <Sparkles className="w-4 h-4" />
            AI-Powered Voice Conversion
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            <span className="neon-text">Sing Any Song</span>
            <br />
            <span className="neon-text-magenta">In Your Voice</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform any song into your voice using cutting-edge AI. 
            Works with any language - Tamil, Hindi, English, and more.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4 text-primary" />
              Any Language
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-secondary" />
              YouTube Support
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-neon-green" />
              Privacy First
            </div>
          </div>

          {/* Backend Status */}
          <div className="flex flex-col items-center gap-3">
            <BackendStatus
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              isConnected={isConnected}
              setIsConnected={setIsConnected}
            />
            {!isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSetupWizard(true)}
                className="gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Setup Guide
              </Button>
            )}
          </div>
        </section>

        {/* Main Content */}
        {resultUrl ? (
          <div className="max-w-2xl mx-auto">
            <ResultPlayer audioUrl={resultUrl} onReset={handleReset} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <VoiceRecorder
                onVoiceReady={(blob) => setVoiceFile(blob)}
                voiceFile={voiceFile}
                setVoiceFile={setVoiceFile}
              />
              <SongInput
                onSongReady={(song) => setSongData(song)}
                songData={songData}
                setSongData={setSongData}
              />

              {/* Process Button */}
              <Button
                variant="neon"
                size="xl"
                className="w-full"
                onClick={handleStartProcessing}
                disabled={!isReadyToProcess || !isConnected}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isProcessing ? "Processing..." : "Clone My Voice"}
              </Button>

              {!isConnected && (
                <p className="text-center text-sm text-destructive">
                  Connect to the backend server to start processing
                </p>
              )}
            </div>

            {/* Right Column - Pipeline */}
            <div>
              <ProcessingPipeline
                isProcessing={isProcessing}
                currentStep={currentStep}
                error={error || undefined}
              />
            </div>
          </div>
        )}

        {/* Footer Info */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            ⚠️ For personal/demo use only. Do not redistribute copyrighted content.
          </p>
          <p>
            Requires Python backend with FastAPI, RVC, and Demucs.{" "}
            <a href="#" className="text-primary hover:underline">
              View setup guide →
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
