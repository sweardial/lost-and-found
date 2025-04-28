import { verify } from "jsonwebtoken";
import { cookies } from "next/headers"; // Next.js app router
import { NextResponse } from "next/server";
import { JWT_SECRET } from "../../lib/envs";


export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ session: null });
  }

  if (!token) {
    return NextResponse.json({ session: { userId } });
  }

  try {
    const session = verify(token, JWT_SECRET);

    return NextResponse.json({ session });
  } catch (err) {
    console.error("Invalid session token", err);
    return NextResponse.json({ session: null });
  }
}
