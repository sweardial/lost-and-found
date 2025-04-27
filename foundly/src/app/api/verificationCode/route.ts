import { NextResponse } from "next/server";
import { verifyEmailConfirmationCode } from "../../lib/login";
import { LimitError, NotFoundError, ValidationError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    await verifyEmailConfirmationCode({ email, code });

    return NextResponse.json({ status: 200 });
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

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
