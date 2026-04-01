import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

function xmlToJson(xml: string) {
  // Very simplified regex-based approach for client-side tool
  // A robust solution would use a DOMParser but that gets complex for a simple tool
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid XML");
  }

  function nodeToObject(node: any): any {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue.trim();
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }
    
    const obj: any = {};
    
    if (node.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < node.attributes.length; j++) {
        const attribute = node.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
    
    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
      if (Object.keys(obj).length === 0) {
        return node.childNodes[0].nodeValue.trim();
      }
      obj["#text"] = node.childNodes[0].nodeValue.trim();
      return obj;
    }
    
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes.item(i);
      if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim() === "") continue;
      
      const childObj = nodeToObject(child);
      if (childObj === null) continue;
      
      const nodeName = child.nodeName;
      if (obj[nodeName] === undefined) {
        obj[nodeName] = childObj;
      } else {
        if (!Array.isArray(obj[nodeName])) {
          obj[nodeName] = [obj[nodeName]];
        }
        obj[nodeName].push(childObj);
      }
    }
    
    return obj;
  }

  const root = doc.documentElement;
  const result: any = {};
  result[root.nodeName] = nodeToObject(root);
  return result;
}

export default function XmlJson() {
  const [xml, setXml] = useState("");
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setXml(val);
    
    try {
      setError(null);
      if (!val.trim()) {
        setJson("");
        return;
      }
      const result = xmlToJson(val);
      setJson(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.message || "Invalid XML");
      setJson("");
    }
  };

  const handleCopy = () => {
    if (!json) return;
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">XML to JSON</h1>
          <p className="text-muted-foreground mt-2">Convert XML documents to JSON objects.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[500px]">
          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-medium">XML Input</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Textarea 
                placeholder="<root><item>Hello</item></root>"
                value={xml}
                onChange={handleInputChange}
                className="h-full min-h-[500px] w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm bg-muted/30"
              />
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">JSON Output</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleCopy} disabled={!json}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-destructive bg-destructive/5 text-sm font-medium">
                  {error}
                </div>
              ) : (
                <Textarea 
                  value={json}
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
