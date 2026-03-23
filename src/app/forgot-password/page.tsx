"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc3, Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed");
      setEmailSent(true);
    } catch {
      toast.error("Failed to send password reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#2C1E14] border-[#4A3728]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-[#3D2B1F] border border-[#4A3728] w-fit">
              <CheckCircle className="h-8 w-8 text-[#27AE60]" />
            </div>
            <CardTitle className="text-xl text-[#F5E6D3] font-mono tracking-wider">GOT IT!</CardTitle>
            <CardDescription className="text-[#A08060]">
              Check <strong className="text-[#D4A574]">{email}</strong> for a reset link (should be there in a sec)
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-[#A08060]">
            <p>Keep an eye on your inbox (and spam folder just in case).</p>
            <p className="mt-2">Your link expires in 1 hour, so don't take too long.</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full border-[#4A3728] text-[#D4A574] hover:bg-[#3D2B1F]"
              onClick={() => { setEmail(""); setEmailSent(false); }}
            >
              <Mail className="mr-2 h-4 w-4" /> Try a different email
            </Button>
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

  return (
    <div className="min-h-screen bg-[#1A1410] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E8732A] to-[#D4A574] flex items-center justify-center">
              <Disc3 className="w-7 h-7 text-[#1A1410]" />
            </div>
          </Link>
        </div>

        <Card className="bg-[#2C1E14] border-[#4A3728]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-[#F5E6D3] font-mono tracking-wider">OOPS, FORGOT IT?</CardTitle>
            <CardDescription className="text-[#A08060]">
              No worries! Tell us your email and we'll help you get back in
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
                  disabled={isLoading}
                  autoFocus
                  className="bg-[#1A1410] border-[#4A3728] text-[#F5E6D3] placeholder:text-[#6B5040] focus:border-[#D4A574]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono tracking-wider"
                disabled={isLoading || !email}
              >
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...</> : "Send the link"}
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
    </div>
  );
}
