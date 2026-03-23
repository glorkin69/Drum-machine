"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc3, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for authentication errors from URL params
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "AuthError") {
      toast.error("Hmm, something went wrong signing you in. Give it another shot?");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase(),
        password,
      });

      if (result?.error) {
        console.error("[Login] Authentication failed:", result.error);
        toast.error("Email or password isn't matching up");

        // Log additional diagnostics in development
        if (process.env.NODE_ENV === "development") {
          console.log("[Login] Check diagnostics at /api/auth/diagnostics?email=" + email.toLowerCase());
        }
        setIsLoading(false);
        setIsSubmitting(false);
      } else {
        // Success! Show toast and navigate
        toast.success("You're in! Let's make some noise.");

        // Refresh the router to update the session, then navigate
        router.refresh();

        // Use a small delay to ensure session is updated before navigation
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);

        // Safety timeout: reset loading state if navigation doesn't complete within 5 seconds
        setTimeout(() => {
          setIsLoading(false);
          setIsSubmitting(false);
        }, 5000);
      }
    } catch (error) {
      console.error("[Login] Error during sign in:", error);
      toast.error("Something went sideways. Want to try again?");
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
            <CardTitle className="text-xl text-[#F5E6D3] font-mono tracking-wider">SIGN IN</CardTitle>
            <CardDescription className="text-[#A08060]">
              Enter your credentials to unlock your drum patterns
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#D4A574] font-mono text-xs tracking-wider">EMAIL</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isSubmitting}
                  className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040] focus:border-[#D4A574] focus:ring-[#D4A574]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#D4A574] font-mono text-xs tracking-wider">PASSWORD</Label>
                  <Link href="/forgot-password" className="text-xs text-[#E8732A] hover:text-[#D4A574] transition-colors">
                    Lost it?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (we won't judge how simple it is)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || isSubmitting}
                    className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040] focus:border-[#D4A574] focus:ring-[#D4A574] pr-10"
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
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono tracking-wider"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                SIGN IN
              </Button>
              <p className="text-xs text-[#A08060] text-center">
                Don&apos;t have an account yet?{" "}
                <Link href="/register" className="text-[#E8732A] hover:text-[#D4A574] transition-colors">
                  Weird flex but okay
                </Link>
              </p>
            </CardFooter>
        </form>

        {/* Divider */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#4A3728]" />
            <p className="text-xs text-[#A08060] uppercase font-mono tracking-widest">or</p>
            <div className="flex-1 h-px bg-[#4A3728]" />
          </div>
        </div>

        {/* Guest Mode Section */}
        <CardContent className="space-y-3">
          <div className="bg-[#3D2B1F] border border-[#4A3728] rounded px-3 py-2">
            <p className="text-xs text-[#D4A574] font-mono tracking-wider leading-relaxed">
              🎛️ GUEST MODE: Full access, zero accountability · Your beats aren't saved (you'll regret it in 30 seconds)
            </p>
          </div>
          <Link href="/dashboard?guest=true" className="block">
            <Button
              type="button"
              className="w-full bg-[#27AE60] hover:bg-[#229954] text-white font-mono tracking-wider"
            >
              YEP, JUST VISITING
            </Button>
          </Link>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginPageSkeleton() {
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
            <CardTitle className="text-xl text-[#F5E6D3] font-mono tracking-wider">SIGN IN</CardTitle>
            <CardDescription className="text-[#A08060]">Loading...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#E8732A]" />
          </CardContent>
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#4A3728]" />
              <p className="text-xs text-[#A08060] uppercase font-mono tracking-widest">or</p>
              <div className="flex-1 h-px bg-[#4A3728]" />
            </div>
          </div>
          <CardContent className="space-y-3">
            <div className="bg-[#3D2B1F] border border-[#4A3728] rounded px-3 py-2">
              <p className="text-xs text-[#D4A574] font-mono tracking-wider leading-relaxed">
                🎛️ GUEST MODE: Play with full access · No account needed · Patterns not saved
              </p>
            </div>
            <Button
              type="button"
              className="w-full bg-[#27AE60] hover:bg-[#229954] text-white font-mono tracking-wider"
              disabled
            >
              I&apos;M JUST A GUEST!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
