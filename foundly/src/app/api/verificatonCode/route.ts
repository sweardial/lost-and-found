import { NextResponse } from "next/server";
import { handleLoginCode } from "../../lib/login";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const result = await handleLoginCode({ email });

    return NextResponse.json({ message: "CONFIRMED" }, { status: 200 });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
