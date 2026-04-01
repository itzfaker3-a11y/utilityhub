import { Layout } from "@/components/layout";
import { Link, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categories } from "@/lib/tools";

export default function CategoryPage() {
  const [, params] = useRoute("/tools/:category");
  const categoryId = params?.category;
  
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">
            Return home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground mt-2">
            Select a tool from the {category.name} category below.
          </p>
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
    </Layout>
  );
}
