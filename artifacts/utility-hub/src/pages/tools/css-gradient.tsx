import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CssGradient() {
  const [color1, setColor1] = useState("#4f46e5");
  const [color2, setColor2] = useState("#ec4899");
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(90);
  const [css, setCss] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let gradientStr = "";
    if (type === "linear") {
      gradientStr = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    } else {
      gradientStr = `radial-gradient(circle, ${color1}, ${color2})`;
    }
    setCss(`background: ${gradientStr};`);
  }, [color1, color2, type, angle]);

  const handleCopy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CSS Gradient Generator</h1>
          <p className="text-muted-foreground mt-2">Design linear and radial CSS gradients visually.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "linear" && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Angle: {angle}°</Label>
                  </div>
                  <Slider 
                    value={[angle]} 
                    onValueChange={(v) => setAngle(v[0])} 
                    max={360} 
                    min={0} 
                    step={1} 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color 1</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={color1} 
                      onChange={(e) => setColor1(e.target.value)}
                      className="w-12 h-12 p-1 cursor-pointer"
                    />
                    <Input 
                      type="text" 
                      value={color1} 
                      onChange={(e) => setColor1(e.target.value)}
                      className="font-mono flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color 2</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={color2} 
                      onChange={(e) => setColor2(e.target.value)}
                      className="w-12 h-12 p-1 cursor-pointer"
                    />
                    <Input 
                      type="text" 
                      value={color2} 
                      onChange={(e) => setColor2(e.target.value)}
                      className="font-mono flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full h-64 rounded-xl border border-border/50 shadow-inner"
                  style={{ background: css.replace('background: ', '').replace(';', '') }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4 flex flex-row items-center justify-between border-b">
                <CardTitle className="text-lg">CSS Code</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copy
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <code className="font-mono text-sm block whitespace-pre-wrap text-primary">
                  {css}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
