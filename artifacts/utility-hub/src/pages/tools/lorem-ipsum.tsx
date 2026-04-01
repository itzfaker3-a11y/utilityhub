import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const words = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", 
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", 
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", 
    "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", 
    "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", 
    "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", 
    "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
  ];

  const generateText = () => {
    let result = "";
    for (let i = 0; i < paragraphs; i++) {
      let paragraph = "";
      for (let j = 0; j < wordsPerParagraph; j++) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        if (j === 0) {
          paragraph += randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
        } else {
          paragraph += randomWord;
        }
        
        if (j === wordsPerParagraph - 1) {
          paragraph += ".";
        } else if (Math.random() > 0.8 && j > 3 && j < wordsPerParagraph - 3) {
          paragraph += ", ";
        } else if (Math.random() > 0.9 && j > 3 && j < wordsPerParagraph - 3) {
          paragraph += ". " + words[Math.floor(Math.random() * words.length)].charAt(0).toUpperCase() + words[Math.floor(Math.random() * words.length)].slice(1) + " ";
        } else {
          paragraph += " ";
        }
      }
      result += paragraph + "\n\n";
    }
    setText(result.trim());
  };

  useEffect(() => {
    generateText();
  }, [paragraphs, wordsPerParagraph]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied", description: "Text copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lorem Ipsum Generator</h1>
          <p className="text-muted-foreground mt-2">Generate placeholder text for layouts and mockups.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Paragraphs: {paragraphs}</Label>
                </div>
                <Slider 
                  value={[paragraphs]} 
                  onValueChange={(v) => setParagraphs(v[0])} 
                  max={20} 
                  min={1} 
                  step={1} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Words/Paragraph: {wordsPerParagraph}</Label>
                </div>
                <Slider 
                  value={[wordsPerParagraph]} 
                  onValueChange={(v) => setWordsPerParagraph(v[0])} 
                  max={200} 
                  min={10} 
                  step={10} 
                />
              </div>

              <Button onClick={generateText} className="w-full" variant="secondary">
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Generated Text</CardTitle>
              <Button onClick={handleCopy} variant="ghost" size="sm">
                {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="whitespace-pre-wrap font-serif leading-relaxed text-muted-foreground">
                {text}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
