import { NextResponse } from "next/server";

/**
 * GET /.well-known/security.txt
 * Standard security.txt file per RFC 9116
 * https://securitytxt.org/
 */
export async function GET() {
  const securityTxt = [
    "# Security Policy for BeatForge 808",
    "# https://securitytxt.org/",
    "",
    "Contact: mailto:security@beatforge808.com",
    "Preferred-Languages: en",
    "Canonical: /.well-known/security.txt",
    `Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}`,
    "",
    "# Please report any security vulnerabilities responsibly.",
    "",
  ].join("\n");

  return new NextResponse(securityTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
