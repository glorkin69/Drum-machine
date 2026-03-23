"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc3, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

// Client-side password requirements check (mirrors server-side validation)
function checkPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pwReqs = checkPasswordRequirements(password);
  const allPwReqsMet = Object.values(pwReqs).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Those passwords aren't matching");
      return;
    }
    if (!allPwReqsMet) {
      toast.error("Password doesn't meet all security requirements");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Couldn't create your account. Give it another shot?");
      } else {
        toast.success("Welcome! Let's sign you in.");
        router.push("/login");
      }
    } catch {
      toast.error("Something went sideways. Mind trying again?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E8732A] to-[#D4A574] flex items-center justify-center">
              <Disc3 className="w-7 h-7 text-[#1A1410]" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold tracking-wider text-[#F5E6D3]" style={{ fontFamily: "'Courier New', monospace" }}>
                BEATFORGE 808
              </h1>
              <p className="text-[0.6rem] tracking-[0.2em] text-[#A08060] uppercase">Rhythm Computer</p>
            </div>
          </Link>
        </div>

        <Card className="bg-[#2C1E14] border-[#4A3728]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-[#F5E6D3] font-mono tracking-wider">CREATE ACCOUNT</CardTitle>
            <CardDescription className="text-[#A08060]">
              Grab your spot and start making patterns
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#D4A574] font-mono text-xs tracking-wider">NAME</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040] focus:border-[#D4A574]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#D4A574] font-mono text-xs tracking-wider">EMAIL</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040] focus:border-[#D4A574]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#D4A574] font-mono text-xs tracking-wider">PASSWORD</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040] focus:border-[#D4A574] pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-[#A08060] hover:text-[#D4A574]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {[
                      { met: pwReqs.minLength, label: "At least 8 characters" },
                      { met: pwReqs.hasUpper, label: "One uppercase letter" },
                      { met: pwReqs.hasLower, label: "One lowercase letter" },
                      { met: pwReqs.hasNumber, label: "One number" },
                      { met: pwReqs.hasSpecial, label: "One special character (!@#$...)" },
                    ].map(({ met, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        {met ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-[#6B5040]" />
                        )}
                        <span className={`text-[0.65rem] font-mono ${met ? "text-green-500" : "text-[#6B5040]"}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#D4A574] font-mono text-xs tracking-wider">CONFIRM PASSWORD</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040] focus:border-[#D4A574]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono tracking-wider"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                LET'S DO THIS
              </Button>
              <p className="text-xs text-[#A08060] text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-[#E8732A] hover:text-[#D4A574] transition-colors">
                  Use it then
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
