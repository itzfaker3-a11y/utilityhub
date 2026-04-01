import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<string>("480");
  const [fps, setFps] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (width) formData.append('width', width);
      if (fps) formData.append('fps', fps);

      const response = await fetch('/api/tools/video-to-gif', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      a.download = `${originalName}.gif`;
      a.click();
      
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Video converted to GIF successfully" });
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
          <h1 className="text-3xl font-bold tracking-tight">Video to GIF</h1>
          <p className="text-muted-foreground mt-2">Convert short video clips into animated GIFs.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
            <CardDescription>Select a video file to convert to GIF.</CardDescription>
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
            
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="width">Width (px)</Label>
                <Input 
                  id="width" 
                  type="number" 
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="480"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="fps">FPS</Label>
                <Input 
                  id="fps" 
                  type="number" 
                  value={fps}
                  onChange={(e) => setFps(e.target.value)}
                  placeholder="10"
                />
              </div>
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
