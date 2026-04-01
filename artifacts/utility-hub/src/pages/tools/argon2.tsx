import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Argon2Page() {
  const [text, setText] = useState("");
  const [type, setType] = useState("argon2id");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tools/argon2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { hash: string; type: string };
      setHash(data.hash);
      toast({ title: "Hash generated", description: `${data.type} hash created.` });
    } catch {
      toast({ title: "Error", description: "Failed to generate hash", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Argon2 Generator</h1>
          <p className="text-muted-foreground mt-2">Generate secure Argon2 password hashes on the server.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Argon2 Hash</CardTitle>
            <CardDescription>Argon2id is the recommended variant for most use cases.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label>Plain Text / Password</Label>
                <Input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to hash..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Algorithm Variant</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="argon2id">argon2id (recommended)</SelectItem>
                    <SelectItem value="argon2i">argon2i (side-channel resistant)</SelectItem>
                    <SelectItem value="argon2d">argon2d (GPU attack resistant)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={!text || loading} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Hash"}
              </Button>
            </form>

            {hash && (
              <div className="mt-6 space-y-2">
                <Label>Result Hash</Label>
                <div className="flex gap-2">
                  <Input value={hash} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                    {copied && <span className="sr-only">Copied</span>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Argon2</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Argon2 is the winner of the Password Hashing Competition (PHC) and is the recommended algorithm for password hashing in modern applications.</p>
            <p><strong>argon2id</strong> — Hybrid variant combining argon2i and argon2d. Best for most use cases.</p>
            <p><strong>argon2i</strong> — Optimized against side-channel attacks. Good for key derivation.</p>
            <p><strong>argon2d</strong> — Resistant to GPU cracking. Best for cryptocurrency.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
