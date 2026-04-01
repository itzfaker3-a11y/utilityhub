import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import lottie from "lottie-web";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LottiePreviewer() {
  const [jsonStr, setJsonStr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content); // Validate JSON
        setJsonStr(content);
        setError(null);
      } catch (err) {
        setError("Invalid JSON file");
        setJsonStr(null);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (jsonStr && containerRef.current) {
      if (animRef.current) {
        animRef.current.destroy();
      }
      
      try {
        const animationData = JSON.parse(jsonStr);
        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: animationData,
        });
      } catch (err) {
        setError("Failed to render animation");
      }
    }

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
      }
    };
  }, [jsonStr]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lottie Previewer</h1>
          <p className="text-muted-foreground mt-2">Preview and test Lottie animation JSON files.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Lottie File</CardTitle>
            <CardDescription>Select a .json animation file.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>Lottie JSON File</Label>
              <Input 
                type="file" 
                accept=".json,application/json"
                onChange={handleFileUpload}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {jsonStr && !error && (
          <Card className="overflow-hidden">
            <div className="bg-muted p-12 flex items-center justify-center min-h-[400px]">
              <div ref={containerRef} className="w-full max-w-[400px]" />
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
