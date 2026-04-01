import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ConvertVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<string>("mp4");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', format);

      const response = await fetch('/api/tools/convert-video', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      a.download = `${originalName}-converted.${format}`;
      a.click();
      
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Video converted successfully" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to convert video", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Converter</h1>
          <p className="text-muted-foreground mt-2">Convert videos or extract audio from MP4, MKV, WebM.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
            <CardDescription>Select a video file to convert to a new format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="video">Video File</Label>
              <Input 
                id="video" 
                type="file" 
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>Target Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="mkv">MKV</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="mp3">MP3 (Audio Only)</SelectItem>
                  <SelectItem value="wav">WAV (Audio Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleConvert} 
              disabled={!file || loading}
              className="w-full max-w-sm"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Convert & Download</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
