import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Download, Youtube, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function YoutubeThumbnail() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/tools/youtube-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error("Failed to fetch thumbnails");

      const data = await response.json();
      setResult(data);
      toast({ title: "Success", description: "Thumbnails fetched successfully" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch thumbnails", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imgUrl: string, quality: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `youtube-thumbnail-${result.videoId}-${quality}.jpg`;
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch (error) {
      window.open(imgUrl, '_blank');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">YouTube Thumbnail Downloader</h1>
          <p className="text-muted-foreground mt-2">Download high-resolution thumbnails from YouTube videos.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>YouTube URL</CardTitle>
            <CardDescription>Enter the link to a YouTube video.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFetch} className="flex gap-4">
              <div className="relative flex-1">
                <Youtube className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..." 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={!url || loading}
                className="h-12 px-8"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && result.thumbnails && (
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">Available Thumbnails</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(result.thumbnails).map(([quality, imgUrl]: [string, any]) => (
                <Card key={quality} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img src={imgUrl} alt={`${quality} quality thumbnail`} className="object-cover w-full h-full" />
                  </div>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{quality} Quality</p>
                    </div>
                    <Button onClick={() => handleDownload(imgUrl, quality)} variant="secondary" size="sm">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
