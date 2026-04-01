import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialMarkdown = `# Welcome to Markdown Editor

This is a **live-preview** markdown editor.

## Features
- Real-time rendering
- HTML export
- Code blocks support

\`\`\`javascript
function sayHello() {
  console.log("Hello World!");
}
\`\`\`

> Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.

[Visit UtilityHub](/)
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [html, setHtml] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const rawHtml = marked.parse(markdown) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    setHtml(cleanHtml);
  }, [markdown]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    toast({ title: "Copied", description: "HTML copied to clipboard" });
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Markdown Editor</h1>
            <p className="text-muted-foreground mt-2">Live-preview Markdown editor with HTML export.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyHtml}>
              <Copy className="mr-2 h-4 w-4" /> Copy HTML
            </Button>
            <Button onClick={handleDownloadMd}>
              <Download className="mr-2 h-4 w-4" /> Download .md
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[600px]">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-medium">Markdown Input</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Textarea 
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="h-full min-h-[600px] w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
                placeholder="Type markdown here..."
              />
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto">
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
