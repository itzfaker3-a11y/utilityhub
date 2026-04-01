import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AspectRatio() {
  const [width1, setWidth1] = useState<number>(1920);
  const [height1, setHeight1] = useState<number>(1080);
  const [width2, setWidth2] = useState<number | "">("");
  const [height2, setHeight2] = useState<number | "">("");
  const [ratio, setRatio] = useState("16:9");

  useEffect(() => {
    // Preset ratios
    if (ratio !== "custom") {
      const [w, h] = ratio.split(':').map(Number);
      if (w && h) {
        // Keep current width1, calculate new height1 based on selected ratio
        setHeight1(Math.round((width1 / w) * h));
      }
    }
  }, [ratio]);

  const handleW1Change = (val: string) => {
    const w = Number(val);
    setWidth1(w);
    setRatio("custom");
    if (width2 !== "" && height2 !== "") {
      setHeight2(Math.round((h1() / w) * width2));
    }
  };

  const handleH1Change = (val: string) => {
    const h = Number(val);
    setHeight1(h);
    setRatio("custom");
  };

  const h1 = () => height1 || 1;
  const w1 = () => width1 || 1;

  const handleW2Change = (val: string) => {
    if (val === "") {
      setWidth2("");
      return;
    }
    const w = Number(val);
    setWidth2(w);
    setHeight2(Math.round((h1() / w1()) * w));
  };

  const handleH2Change = (val: string) => {
    if (val === "") {
      setHeight2("");
      return;
    }
    const h = Number(val);
    setHeight2(h);
    setWidth2(Math.round((w1() / h1()) * h));
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aspect Ratio Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate dimensions based on standard aspect ratios.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calculate Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label>Preset Ratios</Label>
              <Select value={ratio} onValueChange={setRatio}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (HD Video)</SelectItem>
                  <SelectItem value="4:3">4:3 (Classic TV)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  <SelectItem value="9:16">9:16 (Vertical Video)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="space-y-2">
                <Label>Original Width</Label>
                <Input 
                  type="number" 
                  value={width1} 
                  onChange={(e) => handleW1Change(e.target.value)} 
                />
              </div>
              <div className="pt-6 font-bold text-xl">:</div>
              <div className="space-y-2">
                <Label>Original Height</Label>
                <Input 
                  type="number" 
                  value={height1} 
                  onChange={(e) => handleH1Change(e.target.value)} 
                />
              </div>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">New Dimensions</span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="space-y-2">
                <Label>New Width</Label>
                <Input 
                  type="number" 
                  value={width2} 
                  onChange={(e) => handleW2Change(e.target.value)} 
                  placeholder="Enter new width"
                />
              </div>
              <div className="pt-6 font-bold text-xl">:</div>
              <div className="space-y-2">
                <Label>New Height</Label>
                <Input 
                  type="number" 
                  value={height2} 
                  onChange={(e) => handleH2Change(e.target.value)} 
                  placeholder="Enter new height"
                />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
