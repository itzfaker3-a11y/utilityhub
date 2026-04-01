import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ArrowDownUp, Copy, Check } from "lucide-react";

export default function Base64() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processText = (text: string, currentMode: "encode" | "decode") => {
    try {
      setError(null);
      if (!text) {
        setOutput("");
        return;
      }
      if (currentMode === "encode") {
        setOutput(btoa(text));
      } else {
        setOutput(atob(text));
      }
    } catch (err) {
      setError("Invalid Base64 input");
      setOutput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    processText(val, mode);
  };

  const toggleMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInput(output);
    processText(output, newMode);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base64 Encoder/Decoder</h1>
          <p className="text-muted-foreground mt-2">Encode text to Base64 or decode Base64 back to text.</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-medium">
                {mode === "encode" ? "Text Input" : "Base64 Input"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
                value={input}
                onChange={handleInputChange}
                className="min-h-[150px] font-mono"
              />
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={toggleMode} className="gap-2">
              <ArrowDownUp className="h-4 w-4" />
              Switch to {mode === "encode" ? "Decode" : "Encode"}
            </Button>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-medium">
                {mode === "encode" ? "Base64 Output" : "Text Output"}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleCopy} disabled={!output}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-destructive text-sm font-medium min-h-[150px] flex items-center justify-center border rounded-md bg-destructive/10">
                  {error}
                </div>
              ) : (
                <Textarea 
                  value={output}
                  readOnly
                  className="min-h-[150px] font-mono bg-muted/50"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
