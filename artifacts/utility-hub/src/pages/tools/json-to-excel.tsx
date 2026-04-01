import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const EXAMPLE = JSON.stringify(
  [
    { name: "Alice", age: 30, city: "New York" },
    { name: "Bob", age: 25, city: "Los Angeles" },
    { name: "Carol", age: 35, city: "Chicago" },
  ],
  null,
  2
);

export default function JsonToExcel() {
  const [json, setJson] = useState(EXAMPLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validate = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) { setError("JSON must be an array of objects"); return false; }
      setError("");
      return true;
    } catch {
      setError("Invalid JSON");
      return false;
    }
  };

  const handleConvert = async () => {
    if (!validate(json)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tools/json-to-excel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json }),
      });
      if (!res.ok) throw new Error("Conversion failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Excel file downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to convert JSON to Excel", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">JSON to Excel</h1>
          <p className="text-muted-foreground mt-2">Convert a JSON array of objects into an Excel spreadsheet (.xlsx).</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>JSON Input</CardTitle>
            <CardDescription>Paste a JSON array of objects. Each key becomes a column header.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>JSON Array</Label>
              <Textarea
                value={json}
                onChange={(e) => { setJson(e.target.value); validate(e.target.value); }}
                rows={12}
                className="font-mono text-sm"
                placeholder='[{"name": "Alice", "age": 30}]'
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button onClick={handleConvert} disabled={loading || !!error} className="w-full">
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</>
                : <><Download className="mr-2 h-4 w-4" /> Convert & Download Excel</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
