import { useState } from "react";
import { Check, ChevronRight, Terminal, Download, Play, Wifi, X, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SetupWizardProps {
  onClose: () => void;
  onComplete: () => void;
  apiUrl: string;
}

const steps = [
  {
    id: 1,
    title: "Install Python 3.10+",
    description: "Download and install Python from the official website",
    icon: Download,
    commands: null,
    link: "https://www.python.org/downloads/",
  },
  {
    id: 2,
    title: "Install FFmpeg",
    description: "Required for audio processing",
    icon: Terminal,
    commands: {
      windows: "winget install ffmpeg",
      mac: "brew install ffmpeg",
      linux: "sudo apt install ffmpeg",
    },
    link: null,
  },
  {
    id: 3,
    title: "Download Backend Files",
    description: "Get the backend folder from your Lovable project",
    icon: Download,
    commands: null,
    instructions: [
      "1. Click on 'Code' tab in Lovable",
      "2. Navigate to the 'backend' folder",
      "3. Download main.py, requirements.txt, and rvc_infer.py",
      "4. Save them in a folder on your computer",
    ],
  },
  {
    id: 4,
    title: "Install Dependencies",
    description: "Run these commands in the backend folder",
    icon: Terminal,
    commands: {
      all: `cd backend
python -m venv venv

# Activate virtual environment:
# Windows: venv\\Scripts\\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt`,
    },
    link: null,
  },
  {
    id: 5,
    title: "Start the Server",
    description: "Run the FastAPI server",
    icon: Play,
    commands: {
      all: "python main.py",
    },
    link: null,
  },
  {
    id: 6,
    title: "Connect",
    description: "Test the connection from this app",
    icon: Wifi,
    commands: null,
    link: null,
  },
];

export function SetupWizard({ onClose, onComplete, apiUrl }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Command copied to clipboard" });
  };

  const markComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const testConnection = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        const data = await response.json();
        markComplete(6);
        toast({
          title: "Connected!",
          description: `Backend is running. GPU: ${data.gpu_available ? "Available" : "Not detected"}`,
        });
        setTimeout(onComplete, 1000);
      } else {
        throw new Error("Server returned error");
      }
    } catch {
      toast({
        title: "Connection Failed",
        description: "Make sure the server is running on " + apiUrl,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const currentStepData = steps.find((s) => s.id === currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden neon-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
          <CardTitle className="font-display text-xl neon-text">
            Backend Setup Wizard
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Progress Steps */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    completedSteps.includes(step.id)
                      ? "bg-neon-green text-background"
                      : currentStep === step.id
                      ? "bg-primary text-primary-foreground neon-glow"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {completedSteps.includes(step.id) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
            {currentStepData && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <currentStepData.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentStepData.description}
                    </p>
                  </div>
                </div>

                {/* Instructions List */}
                {"instructions" in currentStepData && currentStepData.instructions && (
                  <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                    {currentStepData.instructions.map((instruction, i) => (
                      <p key={i} className="text-sm">{instruction}</p>
                    ))}
                  </div>
                )}

                {/* Commands */}
                {currentStepData.commands && (
                  <div className="space-y-3">
                    {Object.entries(currentStepData.commands).map(([platform, cmd]) => (
                      <div key={platform} className="space-y-1">
                        {platform !== "all" && (
                          <span className="text-xs text-muted-foreground uppercase">
                            {platform}
                          </span>
                        )}
                        <div className="relative group">
                          <pre className="p-3 bg-background/80 rounded-lg text-sm font-mono overflow-x-auto border border-border/50">
                            {String(cmd)}
                          </pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(String(cmd))}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* External Link */}
                {currentStepData.link && (
                  <a
                    href={currentStepData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Download Page
                  </a>
                )}

                {/* Test Connection Button */}
                {currentStep === 6 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Server should be running at: <code className="text-primary">{apiUrl}</code>
                    </p>
                    <Button
                      variant="neon"
                      onClick={testConnection}
                      disabled={isConnecting}
                      className="w-full"
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      {isConnecting ? "Connecting..." : "Test Connection"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/30">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Skip Setup
              </Button>
              {currentStep < 6 && (
                <Button variant="neon" onClick={() => markComplete(currentStep)}>
                  Mark Complete & Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
