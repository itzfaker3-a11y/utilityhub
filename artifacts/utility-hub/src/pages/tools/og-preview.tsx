import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Globe, Loader2, Link as LinkIcon, Image as ImageIcon, Type, LayoutTemplate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OgPreview() {
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
      const response = await fetch('/api/tools/og-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      if (!response.ok) throw new Error("Failed to fetch OG tags");

      const data = await response.json();
      setResult(data);
      toast({ title: "Success", description: "OG data fetched successfully" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch Open Graph data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Open Graph Preview</h1>
          <p className="text-muted-foreground mt-2">Preview how a link will look when shared on social media.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>Enter the URL to preview its Open Graph card.</CardDescription>
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Preview"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Social Preview</h2>
              
              {/* Twitter/Generic Large Card Preview */}
              <div className="border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm max-w-[500px]">
                {result.image ? (
                  <div className="aspect-[1.91/1] bg-muted w-full overflow-hidden border-b">
                    <img src={result.image} alt="OG Image" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] bg-muted w-full flex items-center justify-center border-b text-muted-foreground">
                    <ImageIcon className="h-12 w-12 opacity-20" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 line-clamp-1">
                    {result.siteName || new URL(url.startsWith('http') ? url : 'https://'+url).hostname}
                  </p>
                  <h3 className="font-semibold text-base leading-snug line-clamp-2 mb-1">
                    {result.title || "No title found"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Raw Tags</h2>
              <Card>
                <CardContent className="p-0 divide-y">
                  <div className="p-4 grid grid-cols-[120px_1fr] gap-4 items-start">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Type className="h-4 w-4" /> Title
                    </div>
                    <div className="text-sm font-mono break-words">{result.title || "-"}</div>
                  </div>
                  <div className="p-4 grid grid-cols-[120px_1fr] gap-4 items-start">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <LayoutTemplate className="h-4 w-4" /> Description
                    </div>
                    <div className="text-sm font-mono break-words">{result.description || "-"}</div>
                  </div>
                  <div className="p-4 grid grid-cols-[120px_1fr] gap-4 items-start">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ImageIcon className="h-4 w-4" /> Image
                    </div>
                    <div className="text-sm font-mono break-words truncate" title={result.image}>{result.image || "-"}</div>
                  </div>
                  <div className="p-4 grid grid-cols-[120px_1fr] gap-4 items-start">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <LinkIcon className="h-4 w-4" /> URL
                    </div>
                    <div className="text-sm font-mono break-words truncate">{result.url || "-"}</div>
                  </div>
                  <div className="p-4 grid grid-cols-[120px_1fr] gap-4 items-start">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Globe className="h-4 w-4" /> Site Name
                    </div>
                    <div className="text-sm font-mono break-words">{result.siteName || "-"}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
