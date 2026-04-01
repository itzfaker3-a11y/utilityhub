import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = "";
    if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) charset += "0123456789";
    if (symbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    if (charset === "") {
      setPassword("");
      return;
    }

    let newPassword = "";
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[values[i] % charset.length];
    }
    
    setPassword(newPassword);
    setCopied(false);
  };

  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, symbols]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Password Generator</h1>
          <p className="text-muted-foreground mt-2">Generate secure, random passwords directly in your browser.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input 
                value={password} 
                readOnly 
                className="font-mono text-lg h-12" 
              />
              <Button variant="outline" size="icon" className="h-12 w-12" onClick={generatePassword}>
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button size="icon" className="h-12 w-12" onClick={handleCopy}>
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Length: {length}</Label>
                </div>
                <Slider 
                  value={[length]} 
                  onValueChange={(v) => setLength(v[0])} 
                  max={64} 
                  min={4} 
                  step={1} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
                  <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="lowercase" checked={lowercase} onCheckedChange={setLowercase} />
                  <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="numbers" checked={numbers} onCheckedChange={setNumbers} />
                  <Label htmlFor="numbers">Numbers (0-9)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="symbols" checked={symbols} onCheckedChange={setSymbols} />
                  <Label htmlFor="symbols">Symbols (!@#$)</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
