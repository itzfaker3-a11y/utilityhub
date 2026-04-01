import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categories, ALL_TOOLS } from "@/lib/tools";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.map(c => ({
    ...c,
    tools: c.tools.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.description.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(c => c.tools.length > 0);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <section className="py-12 md:py-20 lg:py-24 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The Definitive Power-User <span className="text-primary">Utility Belt</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[42rem] mx-auto">
            Dense, fast, and instantly accessible. 50+ professional tools for developers and creators. No fluff, just results.
          </p>
          <div className="max-w-xl mx-auto relative mt-8">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search 50+ tools..." 
              className="pl-10 h-12 text-lg bg-background shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        <div className="grid gap-8">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
                <Link href={`/tools/${category.id}`} className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.tools.map((tool) => (
                  <Link key={tool.id} href={tool.path}>
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1 line-clamp-2">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No tools found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
