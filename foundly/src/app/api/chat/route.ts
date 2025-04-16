import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

export async function POST(request: any) {
  try {
    const { message, context } = await request.json();

    const threadId =
      context?.threadId || (await openai.beta.threads.create()).id;

    // Process with AI
    const aiResponse = await processWithOpenAI(message, threadId);

    return NextResponse.json({
      message: aiResponse.message,
      step: aiResponse.step,
      context: {
        ...context,
        threadId,
        lastMessage: message,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

async function processWithOpenAI(
  message: string,
  threadId: string
): Promise<any> {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID || "default_assistant",
  });

  // 4. Poll until the run is complete
  let runStatus = run.status;
  let runResult;
  while (
    runStatus !== "completed" &&
    runStatus !== "failed" &&
    runStatus !== "cancelled"
  ) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    runResult = await openai.beta.threads.runs.retrieve(threadId, run.id);
    runStatus = runResult.status;
  }

  const messages = await openai.beta.threads.messages.list(threadId);

  const lastMessage = messages.data.find((msg) => msg.role === "assistant");

  // Parse the response content
  let responseContent: { message: string; step: string } | null;
  try {
    const contentText = JSON.parse(lastMessage?.content[0].text.value) as {
      message: string;
      step: string;
    };
    responseContent = contentText || null;
  } catch (error) {
    console.error("Error parsing assistant response:", error);
    responseContent = null;
  }

  return {
    message: responseContent?.message || "Sorry, I couldn't understand that.",
    step: responseContent?.step || "",
  };
}
