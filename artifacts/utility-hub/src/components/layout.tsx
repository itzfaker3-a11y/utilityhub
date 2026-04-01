import React from "react";
import { Link, useLocation } from "wouter";
import { Search, Moon, Sun, Menu, Terminal, LayoutDashboard } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { categories, ALL_TOOLS } from "@/lib/tools";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Terminal className="h-5 w-5 text-primary" />
          <span>UtilityHub</span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[280px] flex-col border-r bg-muted/20">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Terminal className="h-5 w-5 text-primary" />
            <span>UtilityHub</span>
          </Link>
        </div>
        <div className="p-4">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-sm text-muted-foreground"
              >
                <Search className="mr-2 h-4 w-4" />
                Search tools...
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Tools">
                    {ALL_TOOLS.map((tool) => (
                      <CommandItem
                        key={tool.id}
                        onSelect={() => {
                          setLocation(tool.path);
                          setSearchOpen(false);
                        }}
                      >
                        {tool.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <ScrollArea className="flex-1">
          <SidebarContent />
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            Toggle Theme
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <Link href="/" className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${location === "/" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
      {categories.map((category) => (
        <div key={category.id} className="flex flex-col gap-1">
          <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {category.name}
          </h4>
          <div className="flex flex-col gap-1 mt-1">
            {category.tools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className={`flex items-center rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground ${
                  location === tool.path ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
