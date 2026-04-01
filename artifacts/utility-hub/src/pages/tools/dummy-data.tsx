import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";

type FieldType = "name" | "email" | "phone" | "address" | "company" | "date" | "uuid" | "number" | "boolean";

const FIELD_TYPES: FieldType[] = ["name", "email", "phone", "address", "company", "date", "uuid", "number", "boolean"];

function randomName() {
  const first = ["Alice", "Bob", "Carol", "David", "Eve", "Frank", "Grace", "Hank", "Iris", "Jack"];
  const last = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Moore"];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
}
function randomEmail(name: string) {
  return name.toLowerCase().replace(" ", ".") + Math.floor(Math.random() * 99) + "@example.com";
}
function randomPhone() { return `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`; }
function randomAddress() {
  const streets = ["Main St", "Oak Ave", "Maple Rd", "Cedar Blvd", "Pine Lane"];
  return `${Math.floor(100 + Math.random() * 9900)} ${streets[Math.floor(Math.random() * streets.length)]}, Springfield`;
}
function randomCompany() {
  const names = ["Acme Corp", "Globex", "Initech", "Umbrella Inc", "Stark Industries", "Wayne Enterprises"];
  return names[Math.floor(Math.random() * names.length)];
}
function randomDate() {
  const start = new Date(2000, 0, 1).getTime();
  const end = new Date().getTime();
  return new Date(start + Math.random() * (end - start)).toISOString().split("T")[0];
}
function randomUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function generateValue(type: FieldType): any {
  switch (type) {
    case "name": return randomName();
    case "email": { const n = randomName(); return randomEmail(n); }
    case "phone": return randomPhone();
    case "address": return randomAddress();
    case "company": return randomCompany();
    case "date": return randomDate();
    case "uuid": return randomUuid();
    case "number": return Math.floor(Math.random() * 10000);
    case "boolean": return Math.random() > 0.5;
    default: return "";
  }
}

export default function DummyDataPage() {
  const [fields, setFields] = useState<{ key: string; type: FieldType }[]>([
    { key: "id", type: "uuid" },
    { key: "name", type: "name" },
    { key: "email", type: "email" },
  ]);
  const [rows, setRows] = useState(10);
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const addField = () => setFields(f => [...f, { key: `field${f.length + 1}`, type: "name" }]);
  const removeField = (i: number) => setFields(f => f.filter((_, idx) => idx !== i));
  const updateField = (i: number, key: string, value: string) => {
    setFields(f => f.map((field, idx) => idx === i ? { ...field, [key]: value } : field));
  };

  const generate = () => {
    const data = Array.from({ length: rows }, () => {
      const row: Record<string, any> = {};
      fields.forEach(f => { row[f.key] = generateValue(f.type); });
      return row;
    });

    if (format === "json") {
      setOutput(JSON.stringify(data, null, 2));
    } else {
      const headers = fields.map(f => f.key).join(",");
      const csvRows = data.map(row => fields.map(f => `"${row[f.key]}"`).join(","));
      setOutput([headers, ...csvRows].join("\n"));
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const ext = format === "json" ? "json" : "csv";
    const mime = format === "json" ? "application/json" : "text/csv";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dummy-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dummy Data Generator</h1>
          <p className="text-muted-foreground mt-2">Generate bulk fake data in JSON or CSV format.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Number of Rows</Label>
                <Input type="number" min={1} max={1000} value={rows} onChange={e => setRows(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4">
                <Label>Fields</Label>
                <div className="space-y-2">
                  {fields.map((field, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={field.key}
                        onChange={e => updateField(i, "key", e.target.value)}
                        placeholder="field name"
                        className="flex-1"
                      />
                      <Select value={field.type} onValueChange={v => updateField(i, "type", v)}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={() => removeField(i)} disabled={fields.length <= 1} className="px-2">✕</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addField} className="w-full mt-2">+ Add Field</Button>
              </div>

              <Button onClick={generate} className="w-full mt-4">Generate Data</Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 flex flex-col min-h-[600px]">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
              <CardTitle>Output</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copy} disabled={!output}>
                  {copied ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={download} disabled={!output}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <pre className="p-4 bg-muted/30 text-sm overflow-auto h-full font-mono whitespace-pre-wrap">{output}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
