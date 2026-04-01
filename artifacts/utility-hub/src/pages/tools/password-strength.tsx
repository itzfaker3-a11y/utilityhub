import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

interface Strength {
  score: number;
  label: string;
  color: string;
  crackTime: string;
}

function analyzePassword(password: string): Strength & { checks: { label: string; pass: boolean }[] } {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "At least 12 characters", pass: password.length >= 12 },
    { label: "Uppercase letters (A-Z)", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letters (a-z)", pass: /[a-z]/.test(password) },
    { label: "Numbers (0-9)", pass: /[0-9]/.test(password) },
    { label: "Special characters (!@#...)", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const passed = checks.filter(c => c.pass).length;
  const len = password.length;

  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (len >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const capped = Math.min(score, 5);

  const levels: Strength[] = [
    { score: 0, label: "Very Weak", color: "bg-red-500", crackTime: "Instantly" },
    { score: 1, label: "Weak", color: "bg-orange-500", crackTime: "Seconds to minutes" },
    { score: 2, label: "Fair", color: "bg-yellow-500", crackTime: "Hours to days" },
    { score: 3, label: "Good", color: "bg-blue-500", crackTime: "Weeks to months" },
    { score: 4, label: "Strong", color: "bg-green-500", crackTime: "Years" },
    { score: 5, label: "Very Strong", color: "bg-emerald-500", crackTime: "Centuries or more" },
  ];

  return { ...levels[capped], checks };
}

export default function PasswordStrengthPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const result = password ? analyzePassword(password) : null;

  const charsetSize = (() => {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/[0-9]/.test(password)) size += 10;
    if (/[^A-Za-z0-9]/.test(password)) size += 32;
    return size;
  })();

  const entropy = charsetSize > 0 ? Math.floor(password.length * Math.log2(charsetSize)) : 0;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Password Strength Analyzer</h1>
          <p className="text-muted-foreground mt-2">Analyze password strength and estimated crack time.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Enter Password</CardTitle></CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Type a password to analyze..."
                className="pr-10 font-mono text-lg h-12"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle>Strength Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold">{result.label}</span>
                  <Badge className={`${result.color} text-white border-0 hover:${result.color}`}>{result.label}</Badge>
                </div>
                
                <div className="flex gap-1 h-3 w-full bg-muted rounded-full overflow-hidden">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={`h-full flex-1 transition-all duration-300 ${i < result.score || (i === 0 && password.length > 0) ? result.color.replace('bg-', 'bg-') : 'bg-transparent'}`} 
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Length</p>
                    <p className="font-mono font-medium text-lg">{password.length}</p>
                  </div>
                  <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Entropy</p>
                    <p className="font-mono font-medium text-lg">{entropy} <span className="text-sm text-muted-foreground">bits</span></p>
                  </div>
                  <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Charset</p>
                    <p className="font-mono font-medium text-lg">{charsetSize}</p>
                  </div>
                  <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Crack Time</p>
                    <p className="font-mono font-medium text-base">{result.crackTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
              <CardContent>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {result.checks.map((check, i) => (
                    <li key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/20">
                      {check.pass
                        ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        : <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                      <span className={`text-sm ${check.pass ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {check.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
