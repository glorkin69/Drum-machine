"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

function checkPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [pageState, setPageState] = useState<"loading" | "valid" | "invalid" | "success">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setPageState("invalid");
        setErrorMessage("No reset token provided.");
        return;
      }
      try {
        const response = await fetch(`/api/auth/password-reset/verify?token=${token}`);
        const data = await response.json();
        if (data.valid) {
          setPageState("valid");
          setEmail(data.email || null);
        } else {
          setPageState("invalid");
          setErrorMessage(data.message || "Invalid reset link.");
        }
      } catch {
        setPageState("invalid");
        setErrorMessage("Failed to verify reset link.");
      }
    };
    verifyToken();
  }, [token]);

  const pwReqs = checkPasswordRequirements(newPassword);
  const allPwReqsMet = Object.values(pwReqs).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (!allPwReqsMet) { toast.error("Password doesn't meet all security requirements"); return; }
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");
      setPageState("success");
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#2C1E14] border-[#4A3728]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-[#F5E6D3] font-mono">CHECKING YOUR LINK...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#E8732A]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === "invalid") {
    return (
      <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#2C1E14] border-[#4A3728]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-[#3D2B1F] w-fit">
              <XCircle className="h-8 w-8 text-[#C0392B]" />
            </div>
            <CardTitle className="text-xl text-[#F5E6D3] font-mono">UH OH</CardTitle>
            <CardDescription className="text-[#A08060]">{errorMessage}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/forgot-password" className="w-full">
              <Button className="w-full bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono">Request a new reset link</Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#2C1E14] border-[#4A3728]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-[#3D2B1F] w-fit">
              <CheckCircle className="h-8 w-8 text-[#27AE60]" />
            </div>
            <CardTitle className="text-xl text-[#F5E6D3] font-mono">YOU'RE ALL SET!</CardTitle>
            <CardDescription className="text-[#A08060]">
              Your password is good to go. Time to get back to making beats.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono">Sign in to your account</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#2C1E14] border-[#4A3728]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-[#F5E6D3] font-mono tracking-wider">CREATE NEW PASSWORD</CardTitle>
          <CardDescription className="text-[#A08060]">
            {email ? <>Pick something good for <strong className="text-[#D4A574]">{email}</strong></> : "Time for a fresh password"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[#D4A574] font-mono text-xs tracking-wider">NEW PASSWORD</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  autoFocus
                  className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-[#A08060]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {newPassword.length > 0 && (
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
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono"
              disabled={isLoading || !allPwReqsMet || !confirmPassword || newPassword !== confirmPassword}
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving new password...</> : "Save new password"}
            </Button>
            <Link href="/login" className="w-full">
              <Button type="button" variant="ghost" className="w-full text-[#A08060] hover:text-[#D4A574] hover:bg-[#3D2B1F]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1A1410] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#E8732A]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
