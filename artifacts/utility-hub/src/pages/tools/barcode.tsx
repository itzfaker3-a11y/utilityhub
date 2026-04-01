import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";

export default function BarcodePage() {
  const [text, setText] = useState("1234567890");
  const [format, setFormat] = useState("CODE128");
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const FORMATS = ["CODE128", "EAN13", "EAN8", "UPC", "CODE39", "ITF14", "MSI", "pharmacode"];

  useEffect(() => {
    if (!text) {
      if (svgRef.current) svgRef.current.innerHTML = "";
      setError(null);
      return;
    }
    const el = svgRef.current;
    if (!el) return;

    import("jsbarcode").then(({ default: JsBarcode }) => {
      try {
        setError(null);
        JsBarcode(el, text, {
          format,
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 16,
          margin: 10,
        });
      } catch (err: any) {
        setError(err.message || "Invalid input for this barcode format");
        el.innerHTML = "";
      }
    });
  }, [text, format]);

  const downloadSvg = () => {
    const el = svgRef.current;
    if (!el) return;
    const svgData = new XMLSerializer().serializeToString(el);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    const el = svgRef.current;
    if (!el) return;
    const svgData = new XMLSerializer().serializeToString(el);
    const img = new Image();
    const svg64 = btoa(svgData);
    img.src = "data:image/svg+xml;base64," + svg64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 400;
      canvas.height = img.height || 160;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "barcode.png";
      a.click();
    };
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barcode Generator</h1>
          <p className="text-muted-foreground mt-2">Generate standard barcodes (EAN-13, UPC, Code128, and more).</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Text / Value</Label>
                <Input value={text} onChange={e => setText(e.target.value)} placeholder="Enter barcode value" />
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center justify-center p-6 bg-muted/20">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 min-h-[150px] flex flex-col items-center justify-center w-full">
              {error ? (
                <p className="text-destructive text-sm font-medium">{error}</p>
              ) : (
                <svg ref={svgRef} className="max-w-full h-auto" />
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadSvg} disabled={!text || !!error}>
                <Download className="mr-2 h-4 w-4" /> SVG
              </Button>
              <Button onClick={downloadPng} disabled={!text || !!error}>
                <Download className="mr-2 h-4 w-4" /> PNG
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
