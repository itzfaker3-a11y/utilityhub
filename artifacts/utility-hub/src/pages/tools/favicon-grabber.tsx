import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Download, Globe, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FaviconGrabber() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
      setUrl(targetUrl);
    }
    
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/tools/favicon-grabber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      if (!response.ok) throw new Error("Failed to fetch favicons");

      const data = await response.json();
      setResult(data);
      toast({ title: "Success", description: "Favicons fetched successfully" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch favicons", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imgUrl: string, size: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      const domain = new URL(url.startsWith('http') ? url : 'https://' + url).hostname;
      a.download = `${domain}-favicon-${size || 'default'}.png`;
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
          <h1 className="text-3xl font-bold tracking-tight">Favicon Grabber</h1>
          <p className="text-muted-foreground mt-2">Fetch and download favicon icons from any website.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>Enter the URL of the website to grab favicons from.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFetch} className="flex gap-4">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="url"
                  placeholder="https://example.com" 
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

        {result && result.icons && result.icons.length > 0 && (
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">Found Favicons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {result.icons.map((icon: any, i: number) => (
                <Card key={i} className="overflow-hidden flex flex-col">
                  <div className="flex-1 p-6 flex items-center justify-center bg-muted/30">
                    <img src={icon.url} alt={`Favicon ${icon.size || 'default'}`} className="max-w-16 max-h-16 object-contain" />
                  </div>
                  <CardContent className="p-3 flex flex-col gap-2 border-t">
                    <p className="text-xs text-center font-mono text-muted-foreground truncate" title={icon.size || 'Unknown size'}>
                      {icon.size || 'Unknown size'}
                    </p>
                    <Button onClick={() => handleDownload(icon.url, icon.size || 'default')} variant="secondary" size="sm" className="w-full text-xs">
                      <Download className="mr-1 h-3 w-3" /> Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {result && (!result.icons || result.icons.length === 0) && (
          <div className="p-8 text-center bg-muted/20 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No favicons found for this URL.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
