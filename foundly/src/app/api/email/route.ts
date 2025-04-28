import { LimitError, NotFoundError } from "@/lib/errors";
import { NextResponse } from "next/server";
import { handleEmailLoginCode } from "../../lib/login";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const userId = await handleEmailLoginCode({ email });

    const response = NextResponse.json({ userId });

    response.cookies.set("userId", userId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 10,
    });

    return response;
  } catch (err) {
    if (err instanceof LimitError) {
      //create error codes constants
      return NextResponse.json({ error: err.message }, { status: 429 });
    }

    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
