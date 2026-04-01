import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadToolProps {
  title: string;
  description: string;
  endpoint: string;
  accept: string;
  multiple?: boolean;
  resultType: "blob" | "json";
  downloadExt?: string;
}

export function FileUploadTool({ title, description, endpoint, accept, multiple = false, resultType, downloadExt }: FileUploadToolProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      if (multiple) {
        Array.from(files).forEach(f => formData.append('files', f));
      } else {
        formData.append('file', files[0]);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Processing failed");

      if (resultType === "blob") {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const originalName = files[0].name.substring(0, files[0].name.lastIndexOf('.')) || files[0].name;
        a.download = `${originalName}-processed${downloadExt ? `.${downloadExt}` : ''}`;
        a.click();
        
        URL.revokeObjectURL(url);
        toast({ title: "Success", description: "File processed and downloaded successfully" });
      } else {
        const data = await response.json();
        setResult(data);
        toast({ title: "Success", description: "File processed successfully" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to process file", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload File{multiple ? 's' : ''}</CardTitle>
            <CardDescription>Select file{multiple ? 's' : ''} to process.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>File Input</Label>
              <Input 
                type="file" 
                accept={accept}
                multiple={multiple}
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
            
            <Button 
              onClick={handleProcess} 
              disabled={!files || files.length === 0 || loading}
              className="w-full max-w-sm"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Process {resultType === "blob" ? "& Download" : ""}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && resultType === "json" && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
