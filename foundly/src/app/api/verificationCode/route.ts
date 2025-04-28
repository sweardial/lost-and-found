import { LimitError, NotFoundError, ValidationError } from "@/lib/errors";
import { NextResponse } from "next/server";
import { handleEmailConfirmationCode } from "../../lib/login";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    const cookieStore = await cookies();

    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 403 });
    }

    const jtwToken = await handleEmailConfirmationCode({ userId, code });

    const response = NextResponse.json({ status: 200 });

    response.cookies.set("session_token", jtwToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (err) {
    if (err instanceof LimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }

    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }

    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    console.log({ err });

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
