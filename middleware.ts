import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const url = new URL("/", req.nextUrl.origin);
    url.searchParams.set("login", "1");
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/app/:path*"],
};
