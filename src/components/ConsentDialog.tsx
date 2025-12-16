import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface ConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentDialog({ open, onAccept, onDecline }: ConsentDialogProps) {
  const [agreements, setAgreements] = useState({
    ownVoice: false,
    personalUse: false,
    noCelebrity: false,
  });

  const allAgreed = Object.values(agreements).every(Boolean);

  const handleCheckboxChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="glass-card neon-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">Terms & Conditions</DialogTitle>
          </div>
          <DialogDescription>
            Please read and accept the following terms before using the voice cloning feature.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Important Notice</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This tool is for personal/demo use only. Misuse may violate copyright and privacy laws.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <Checkbox
                checked={agreements.ownVoice}
                onCheckedChange={() => handleCheckboxChange("ownVoice")}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-sm">I own the voice I'm uploading</p>
                <p className="text-xs text-muted-foreground">
                  The voice recording is my own or I have explicit permission to use it.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <Checkbox
                checked={agreements.personalUse}
                onCheckedChange={() => handleCheckboxChange("personalUse")}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-sm">For personal use only</p>
                <p className="text-xs text-muted-foreground">
                  I will not commercially distribute or publicly share the generated content.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <Checkbox
                checked={agreements.noCelebrity}
                onCheckedChange={() => handleCheckboxChange("noCelebrity")}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-sm">No celebrity voice cloning</p>
                <p className="text-xs text-muted-foreground">
                  I will not attempt to clone the voices of celebrities, public figures, or others without consent.
                </p>
              </div>
            </label>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button variant="ghost" onClick={onDecline}>
            Decline
          </Button>
          <Button
            variant="neon"
            onClick={onAccept}
            disabled={!allAgreed}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
