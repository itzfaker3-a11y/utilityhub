import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Mic, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioMetadata {
  duration?: number;
  bitrate?: string;
  format?: string;
  codec?: string;
  sampleRate?: string;
  channels?: number;
  hasSubtitles?: boolean;
}

interface TranscriptionResult {
  transcription: string | null;
  metadata: AudioMetadata;
  message: string;
}

export default function AudioToText() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/tools/audio-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Processing failed");
      }

      const data: TranscriptionResult = await response.json();
      setResult(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process audio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audio to Text</h1>
          <p className="text-muted-foreground mt-2">
            Transcribe speech from audio and video files using AI-powered recognition.
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="pt-4">
            <div className="flex gap-2 text-sm text-amber-800 dark:text-amber-200">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Transcription powered by OpenAI Whisper (gpt-4o-mini-transcribe).
                Upload an audio or video file to get the spoken content as text.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Audio File</CardTitle>
            <CardDescription>Select an audio or video file to analyze.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="audio">Audio / Video File</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button
              onClick={handleProcess}
              disabled={!file || loading}
              className="w-full max-w-sm"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Mic className="mr-2 h-4 w-4" /> Analyze Audio</>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <>
            {result.transcription && (
              <Card>
                <CardHeader>
                  <CardTitle>Transcription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-96 overflow-auto">
                    {result.transcription}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{result.message}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Audio Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(result.metadata.duration)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Format</p>
                    <p className="font-medium">{result.metadata.format || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Codec</p>
                    <p className="font-medium">{result.metadata.codec || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sample Rate</p>
                    <p className="font-medium">{result.metadata.sampleRate ? `${result.metadata.sampleRate} Hz` : "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Channels</p>
                    <p className="font-medium">{result.metadata.channels === 1 ? "Mono" : result.metadata.channels === 2 ? "Stereo" : result.metadata.channels || "Unknown"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
