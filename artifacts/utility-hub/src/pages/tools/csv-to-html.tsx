import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CsvToHtml() {
  const [csv, setCsv] = useState("");
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCsv(val);
    
    try {
      setError(null);
      if (!val.trim()) {
        setHtml("");
        return;
      }

      const lines = val.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) return;

      let result = '<table>\n';
      
      lines.forEach((line, i) => {
        const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const tag = i === 0 ? 'th' : 'td';
        
        if (i === 0) result += '  <thead>\n';
        if (i === 1) result += '  <tbody>\n';
        
        result += '    <tr>\n';
        cells.forEach(cell => {
          result += `      <${tag}>${cell}</${tag}>\n`;
        });
        result += '    </tr>\n';
        
        if (i === 0) result += '  </thead>\n';
      });

      if (lines.length > 1) {
        result += '  </tbody>\n';
      }
      result += '</table>';
      
      setHtml(result);
    } catch (err: any) {
      setError("Failed to parse CSV");
      setHtml("");
    }
  };

  const handleCopy = () => {
    if (!html) return;
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CSV to HTML Table</h1>
          <p className="text-muted-foreground mt-2">Convert CSV data into an HTML table structure.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[500px]">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-medium">CSV Input</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Textarea 
                placeholder="name,age,city&#10;John,30,New York&#10;Jane,25,London"
                value={csv}
                onChange={handleConvert}
                className="h-full min-h-[500px] w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm bg-muted/30"
              />
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">HTML Output</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleCopy} disabled={!html}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-destructive bg-destructive/5 text-sm font-medium">
                  {error}
                </div>
              ) : (
                <Textarea 
                  value={html}
                  readOnly
                  className="h-full min-h-[500px] w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm bg-muted/50 text-primary"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
