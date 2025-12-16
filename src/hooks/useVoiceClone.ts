import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface UseVoiceCloneOptions {
  apiUrl: string;
}

interface VoiceCloneState {
  isProcessing: boolean;
  currentStep: number;
  error: string | null;
  resultUrl: string | null;
}

export function useVoiceClone({ apiUrl }: UseVoiceCloneOptions) {
  const [state, setState] = useState<VoiceCloneState>({
    isProcessing: false,
    currentStep: 0,
    error: null,
    resultUrl: null,
  });

  const uploadVoice = useCallback(
    async (voiceBlob: Blob) => {
      const formData = new FormData();
      formData.append("file", voiceBlob, "voice.webm");

      const response = await fetch(`${apiUrl}/upload-voice`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload voice sample");
      }

      return response.json();
    },
    [apiUrl]
  );

  const submitSong = useCallback(
    async (song: { type: "url" | "file"; value: string | File }) => {
      if (song.type === "url") {
        const response = await fetch(`${apiUrl}/song-from-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: song.value }),
        });

        if (!response.ok) {
          throw new Error("Failed to process song URL");
        }

        return response.json();
      } else {
        const formData = new FormData();
        formData.append("file", song.value);

        const response = await fetch(`${apiUrl}/upload-song`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload song file");
        }

        return response.json();
      }
    },
    [apiUrl]
  );

  const processVoiceClone = useCallback(
    async (
      voiceBlob: Blob,
      song: { type: "url" | "file"; value: string | File }
    ) => {
      setState({
        isProcessing: true,
        currentStep: 0,
        error: null,
        resultUrl: null,
      });

      try {
        // Step 1: Upload voice
        toast({ title: "Processing", description: "Uploading your voice..." });
        await uploadVoice(voiceBlob);
        setState((prev) => ({ ...prev, currentStep: 1 }));

        // Step 2: Submit song
        toast({ title: "Processing", description: "Downloading song..." });
        await submitSong(song);
        setState((prev) => ({ ...prev, currentStep: 2 }));

        // Step 3: Train voice model
        toast({ title: "Processing", description: "Training voice model..." });
        const trainResponse = await fetch(`${apiUrl}/train-voice`, {
          method: "POST",
        });
        if (!trainResponse.ok) throw new Error("Voice training failed");
        setState((prev) => ({ ...prev, currentStep: 3 }));

        // Step 4: Convert song
        toast({ title: "Processing", description: "Converting vocals..." });
        const convertResponse = await fetch(`${apiUrl}/convert-song`, {
          method: "POST",
        });
        if (!convertResponse.ok) throw new Error("Voice conversion failed");
        setState((prev) => ({ ...prev, currentStep: 4 }));

        // Step 5: Get result
        toast({ title: "Processing", description: "Finalizing..." });
        const resultResponse = await fetch(`${apiUrl}/result`);
        if (!resultResponse.ok) throw new Error("Failed to get result");

        const resultBlob = await resultResponse.blob();
        const resultUrl = URL.createObjectURL(resultBlob);

        setState((prev) => ({
          ...prev,
          currentStep: 5,
          isProcessing: false,
          resultUrl,
        }));

        toast({
          title: "Success!",
          description: "Your voice-cloned song is ready!",
        });

        return resultUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
        }));
        toast({
          title: "Processing Failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      }
    },
    [apiUrl, uploadVoice, submitSong]
  );

  const reset = useCallback(() => {
    if (state.resultUrl) {
      URL.revokeObjectURL(state.resultUrl);
    }
    setState({
      isProcessing: false,
      currentStep: 0,
      error: null,
      resultUrl: null,
    });
  }, [state.resultUrl]);

  return {
    ...state,
    processVoiceClone,
    reset,
  };
}
