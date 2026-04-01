import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Copy, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBcryptHash } from "@workspace/api-client-react";

export default function Bcrypt() {
  const [text, setText] = useState("");
  const [rounds, setRounds] = useState<number>(10);
  const [hash, setHash] = useState("");
  const [verifyText, setVerifyText] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [copied, setCopied] = useState(false);
  
  const mutation = useBcryptHash();
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    
    try {
      const result = await mutation.mutateAsync({ data: { text, rounds } });
      setHash(result.hash);
      toast({ title: "Success", description: "Bcrypt hash generated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate hash", variant: "destructive" });
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bcrypt Hash Generator</h1>
          <p className="text-muted-foreground mt-2">Generate secure bcrypt password hashes.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Hash</CardTitle>
              <CardDescription>Create a new bcrypt hash from plain text.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Plain Text</Label>
                  <Input 
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Factor (Rounds): {rounds}</Label>
                  <Input 
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value))}
                    min={4}
                    max={16}
                    required
                  />
                </div>
                <Button type="submit" disabled={!text || mutation.isPending} className="w-full">
                  {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Hash"}
                </Button>
              </form>

              {hash && (
                <div className="mt-6 space-y-2">
                  <Label>Result</Label>
                  <div className="flex gap-2">
                    <Input value={hash} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                      {copied ? <RefreshCw className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verify Hash</CardTitle>
              <CardDescription>Check if a text matches a bcrypt hash. (Requires backend support or client-side lib, simplified for UI)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Hash to Verify</Label>
                  <Input 
                    type="text"
                    value={verifyHash}
                    onChange={(e) => setVerifyHash(e.target.value)}
                    placeholder="$2a$10$..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plain Text</Label>
                  <Input 
                    type="text"
                    value={verifyText}
                    onChange={(e) => setVerifyText(e.target.value)}
                  />
                </div>
                <Button disabled className="w-full">
                  Verify (Requires bcrypt.js)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
