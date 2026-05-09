// import { NextRequest, NextResponse } from "next/server";
// import { db } from "~/server/db";
// import { users } from "~/server/db/schema";
// import { eq } from "drizzle-orm";

// export async function POST(req: NextRequest) {
//   try {
//     const { accessToken } = await req.json();

//     if (!accessToken) {
//       return NextResponse.json(
//         { error: "Missing accessToken" },
//         { status: 400 },
//       );
//     }

//     const spotifyRes = await fetch("https://api.spotify.com/v1/me", {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     if (!spotifyRes.ok) {
//       return NextResponse.json(
//         { error: "Failed to fetch Spotify profile" },
//         { status: 401 },
//       );
//     }

//     const spotifyUser = await spotifyRes.json();

//     const spotifyId = spotifyUser.id;
//     const displayName = spotifyUser.display_name;

//     const existingUser = await db
//       .select()
//       .from(users)
//       .where(eq(users.spotifyId, spotifyId))
//       .limit(1);

//     if (existingUser.length === 0) {
//       // CREATE
//       await db.insert(users).values({
//         id: crypto.randomUUID(),
//         spotifyId,
//         displayName,
//       });
//     } else {
//       // UPDATE
//       await db
//         .update(users)
//         .set({
//           displayName,
//         })
//         .where(eq(users.spotifyId, spotifyId));
//     }

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("SYNC USER ERROR:", err);

//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }
