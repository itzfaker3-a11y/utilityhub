import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function WordCounter() {
  const [text, setText] = useState("");

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
  const readingTime = Math.ceil(words / 200); // avg 200 wpm

  // Calculate keyword density
  const getKeywordDensity = () => {
    if (!text.trim()) return [];
    
    const wordList: string[] = text.toLowerCase().match(/\b\w+\b/g) ?? [];
    if (wordList.length === 0) return [];
    
    const stops = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    const counts: Record<string, number> = {};
    let totalValid = 0;
    
    wordList.forEach(w => {
      if (w.length > 2 && !stops.has(w)) {
        counts[w] = (counts[w] || 0) + 1;
        totalValid++;
      }
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / totalValid) * 100).toFixed(1)
      }));
  };

  const density = getKeywordDensity();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Word Counter</h1>
          <p className="text-muted-foreground mt-2">Count characters, words, and analyze reading time.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{words}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{characters}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">No Spaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{charactersNoSpaces}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Paragraphs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{paragraphs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Reading Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{readingTime} <span className="text-sm font-normal text-muted-foreground">min</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          <Card>
            <CardContent className="p-0">
              <Textarea 
                placeholder="Type or paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[400px] w-full resize-none border-0 rounded-lg focus-visible:ring-0 p-4 font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Keyword Density</CardTitle>
            </CardHeader>
            <CardContent>
              {density.length > 0 ? (
                <div className="space-y-3">
                  {density.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate mr-2" title={item.word}>{item.word}</span>
                      <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                        <span>{item.count}x</span>
                        <span className="w-12 text-right">{item.density}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Not enough text to analyze.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
