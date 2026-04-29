// import { db } from "@/db";
// import { users } from "@/db/schema";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const { code, codeVerifier } = await req.json();

//   const response = await fetch("https://accounts.spotify.com/api/token", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
//       grant_type: "authorization_code",
//       code,
//       redirect_uri: "http://localhost:3000/api/auth/callback",
//       code_verifier: codeVerifier,
//     }),
//   });

//   const data = await response.json();

//   if (data.access_token) {
//     // 1. Отримай дані профілю (GET https://api.spotify.com/v1/me)
//     // 2. Збережи в базу через Drizzle:
//     // await db.insert(users).values({ ... }).onConflictDoUpdate(...)
    
//     // 3. Встанови сесійну куку (Session Cookie)
//     return NextResponse.json({ success: true });
//   }

//   return NextResponse.json({ error: "Failed to get token" }, { status: 400 });
// }