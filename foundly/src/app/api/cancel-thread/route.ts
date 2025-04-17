import { NextResponse } from "next/server";
import { openai } from "../../lib/openai";

export async function POST(request: Request) {
  try {
    const { threadId } = await request.json();

    if (!threadId) {
      return NextResponse.json(
        { error: "ThreadId is required" },
        { status: 400 }
      );
    }

    await openai.beta.threads.del(threadId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling thread:", error);
    return NextResponse.json(
      { error: "Failed to cancel thread" },
      { status: 500 }
    );
  }
}
