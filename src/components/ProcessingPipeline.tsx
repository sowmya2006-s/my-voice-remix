import { useEffect, useState } from "react";
import { Check, Loader2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "error";
  detail?: string;
}

interface ProcessingPipelineProps {
  isProcessing: boolean;
  currentStep: number;
  error?: string;
}

const STEPS: Omit<ProcessingStep, "status">[] = [
  { id: "download", label: "Downloading Song", detail: "Fetching audio from source" },
  { id: "convert", label: "Converting to WAV", detail: "Preparing audio format" },
  { id: "separate", label: "Separating Vocals", detail: "Using AI to isolate voice" },
  { id: "clone", label: "Cloning Voice", detail: "Applying your voice signature" },
  { id: "merge", label: "Merging Audio", detail: "Combining vocals with music" },
  { id: "export", label: "Exporting", detail: "Creating final MP3" },
];

export function ProcessingPipeline({ isProcessing, currentStep, error }: ProcessingPipelineProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const stepProgress = ((currentStep + 1) / STEPS.length) * 100;
      const interval = setInterval(() => {
        setProgress((prev) => {
          const target = stepProgress - 10;
          if (prev < target) return prev + 1;
          return prev;
        });
      }, 50);
      return () => clearInterval(interval);
    } else if (currentStep === STEPS.length - 1) {
      setProgress(100);
    }
  }, [isProcessing, currentStep]);

  const getStepStatus = (index: number): ProcessingStep["status"] => {
    if (error && index === currentStep) return "error";
    if (index < currentStep) return "completed";
    if (index === currentStep && isProcessing) return "processing";
    return "pending";
  };

  const StatusIcon = ({ status }: { status: ProcessingStep["status"] }) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-neon-green" />
          </div>
        );
      case "processing":
        return (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center glow-pulse">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        );
      case "error":
        return (
          <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <Card variant="glass" className="slide-up" style={{ animationDelay: "0.2s" }}>
      <CardHeader>
        <CardTitle className="text-lg">Processing Pipeline</CardTitle>
        <CardDescription>
          {isProcessing
            ? `Step ${currentStep + 1} of ${STEPS.length}`
            : error
            ? "Processing stopped due to an error"
            : "Ready to process"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                  status === "processing"
                    ? "bg-primary/10 neon-border"
                    : status === "completed"
                    ? "bg-neon-green/5"
                    : status === "error"
                    ? "bg-destructive/10"
                    : "bg-muted/20"
                }`}
              >
                <StatusIcon status={status} />
                <div className="flex-1">
                  <p
                    className={`font-medium text-sm ${
                      status === "processing"
                        ? "text-primary"
                        : status === "completed"
                        ? "text-neon-green"
                        : status === "error"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.detail}</p>
                </div>
                {status === "processing" && (
                  <span className="text-xs text-primary animate-pulse">Processing...</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
