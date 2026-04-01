import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/tools/word-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Conversion failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.docx$/i, "") || "document";
      a.download = `${baseName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Success", description: "Word document converted to PDF successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Word to PDF</h1>
          <p className="text-muted-foreground mt-2">
            Convert DOCX Word documents to PDF. Headings, paragraphs, lists and tables are preserved.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Word Document</CardTitle>
            <CardDescription>Select a .docx file to convert to PDF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="docx">Word Document (.docx)</Label>
              <Input
                id="docx"
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}

            <Button
              onClick={handleConvert}
              disabled={!file || loading}
              className="w-full max-w-sm"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Convert to PDF</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About this tool</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Supports .docx format (Word 2007+). The document is converted via server-side rendering.</p>
            <p>Formatting preserved: headings, paragraphs, bullet lists, numbered lists, and tables.</p>
            <p>Maximum file size: 50 MB.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
