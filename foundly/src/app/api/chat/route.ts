import { NextResponse } from "next/server";
import { processChatMessage } from "@/lib/chat";

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    const response = await processChatMessage(message, context);
    return NextResponse.json(response);
  } catch (error) {
    //add error handling

    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
