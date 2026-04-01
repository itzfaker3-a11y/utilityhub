import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateUuids = () => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let uuid: string = crypto.randomUUID();
      if (uppercase) uuid = uuid.toUpperCase();
      if (noDashes) uuid = uuid.replace(/-/g, '');
      newUuids.push(uuid);
    }
    setUuids(newUuids);
  };

  useEffect(() => {
    generateUuids();
  }, [count, uppercase, noDashes]);

  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UUID/GUID Generator</h1>
          <p className="text-muted-foreground mt-2">Generate random version 4 UUIDs in bulk.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Quantity: {count}</Label>
                </div>
                <Slider 
                  value={[count]} 
                  onValueChange={(v) => setCount(v[0])} 
                  max={100} 
                  min={1} 
                  step={1} 
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="uppercase">Uppercase</Label>
                  <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="noDashes">Remove Dashes</Label>
                  <Switch id="noDashes" checked={noDashes} onCheckedChange={setNoDashes} />
                </div>
              </div>

              <Button onClick={generateUuids} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
              
              <Button onClick={handleCopyAll} variant="outline" className="w-full">
                {copiedAll ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy All
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-lg">Generated UUIDs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {uuids.map((uuid, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/50 transition-colors group">
                    <span className="font-mono text-sm">{uuid}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy(uuid, i)}
                    >
                      {copied === i ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
