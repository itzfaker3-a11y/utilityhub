import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ArrowDownUp, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function JsonCsv() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"json-to-csv" | "csv-to-json">("json-to-csv");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processText = (text: string, currentMode: "json-to-csv" | "csv-to-json") => {
    try {
      setError(null);
      if (!text.trim()) {
        setOutput("");
        return;
      }
      
      if (currentMode === "json-to-csv") {
        const data = JSON.parse(text);
        let arr = Array.isArray(data) ? data : [data];
        if (arr.length === 0) {
          setOutput("");
          return;
        }
        const headers = Array.from(new Set(arr.flatMap(Object.keys)));
        let csv = headers.join(",") + "\n";
        
        arr.forEach(obj => {
          csv += headers.map(header => {
            let val = obj[header];
            if (val === null || val === undefined) return "";
            if (typeof val === "object") val = JSON.stringify(val);
            val = String(val).replace(/"/g, '""');
            if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
            return val;
          }).join(",") + "\n";
        });
        
        setOutput(csv.trim());
      } else {
        const lines = text.split("\n").filter(l => l.trim() !== "");
        if (lines.length < 2) {
          setOutput("[]");
          return;
        }
        
        // Simple CSV parser (doesn't handle commas inside quotes perfectly, but good enough for simple cases)
        const parseLine = (line: string) => {
          const result = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') inQuotes = !inQuotes;
            else if (line[i] === ',' && !inQuotes) {
              result.push(current);
              current = "";
            } else {
              current += line[i];
            }
          }
          result.push(current);
          return result.map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        };
        
        const headers = parseLine(lines[0]);
        const result = lines.slice(1).map(line => {
          const values = parseLine(line);
          const obj: any = {};
          headers.forEach((h, i) => {
            let val: any = values[i];
            if (val === "true") val = true;
            else if (val === "false") val = false;
            else if (val === "null") val = null;
            else if (!isNaN(Number(val)) && val !== "") val = Number(val);
            obj[h] = val;
          });
          return obj;
        });
        
        setOutput(JSON.stringify(result, null, 2));
      }
    } catch (err: any) {
      setError(err.message || "Invalid input format");
      setOutput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    processText(val, mode);
  };

  const toggleMode = () => {
    const newMode = mode === "json-to-csv" ? "csv-to-json" : "json-to-csv";
    setMode(newMode);
    setInput(output);
    processText(output, newMode);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Copied", description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">JSON/CSV Converter</h1>
            <p className="text-muted-foreground mt-2">Convert between JSON arrays and CSV tables.</p>
          </div>
          <Button variant="outline" onClick={toggleMode} className="gap-2">
            <ArrowDownUp className="h-4 w-4" />
            Switch to {mode === "json-to-csv" ? "CSV to JSON" : "JSON to CSV"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[500px]">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-medium">
                {mode === "json-to-csv" ? "JSON Input" : "CSV Input"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Textarea 
                placeholder={mode === "json-to-csv" ? '[\n  {"name": "John", "age": 30}\n]' : 'name,age\nJohn,30'}
                value={input}
                onChange={handleInputChange}
                className="h-full min-h-[500px] w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm bg-muted/30"
              />
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {mode === "json-to-csv" ? "CSV Output" : "JSON Output"}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleCopy} disabled={!output}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-destructive bg-destructive/5 text-sm font-medium text-center">
                  {error}
                </div>
              ) : (
                <Textarea 
                  value={output}
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
