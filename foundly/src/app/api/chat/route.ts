// app/api/chat/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

export async function POST(request: any) {
  try {
    const { message, sessionId, context } = await request.json();

    console.log({ context });

    const threadId =
      context?.threadId || (await openai.beta.threads.create()).id;

    console.log({ threadId });

    // Process with AI
    const aiResponse = await processWithOpenAI(message, threadId);

    return NextResponse.json({
      message: aiResponse.message,
      nextAction: aiResponse.nextAction,
      extractedData: aiResponse.extractedData,
      sessionId: sessionId,
      context: {
        ...context,
        threadId,
        lastMessage: message,
        extractedInfo: {
          ...(context?.extractedInfo || {}),
          ...aiResponse.extractedData,
        },
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

interface AssistantResponse {
  currentStage: "WHAT" | string;
  currentMessage: string;
  itemDescription: string;
  pictureRequested: boolean;
  date: string;
  location: string;
  complete: boolean;
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

  // 5. Get the messages from the thread
  const messages = await openai.beta.threads.messages.list(threadId);

  const lastMessage = messages.data.find((msg) => msg.role === "assistant");

  console.log({ lastMessage: lastMessage?.content[0].text.value });

  // Parse the response content
  let responseContent: string | null;
  try {
    //@ts-expect-error for some reason text is not in openai type
    const contentText = lastMessage?.content[0].text.value;
    responseContent = contentText || null;
  } catch (error) {
    console.error("Error parsing assistant response:", error);
    responseContent = null;
  }

  return {
    message: responseContent || "No response from assistant.",
    nextAction: "continue",
    // extractedData: responseContent || {},
  };
}
