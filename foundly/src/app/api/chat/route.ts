import { NextResponse } from "next/server";
import { openai, ASSISTANT_ID } from "../../lib/openai";

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    const threadId =
      context?.threadId || (await openai.beta.threads.create()).id;

    const aiResponse = await processWithOpenAI(message, threadId);

    return NextResponse.json({
      message: aiResponse.message,
      step: aiResponse.step,
      isInappropriate: aiResponse.isInappropriate,
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

async function moderationCheckWithOpenAI(message: string): Promise<boolean> {
  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: message,
  });

  const flagged = response.results.some((result) => result.flagged);

  return flagged;
}

async function processWithOpenAI(
  message: string,
  threadId: string
): Promise<{ message: string; step: string; isInappropriate?: boolean }> {
  const isFlagged = await moderationCheckWithOpenAI(message);

  if (isFlagged) {
    return { message: "Behave!", step: "", isInappropriate: true };
  }

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID || "default_assistant",
  });

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

  let responseContent: { message: string; step: string } | null;
  try {
    //@ts-expect-error type is not defined
    const contentText = JSON.parse(lastMessage?.content[0].text.value) as {
      message: string;
      step: string;
    };
    responseContent = contentText || null;
  } catch (error) {
    console.error("Error parsing assistant response:", error);
    responseContent = null;
  }

  console.log({ responseContent });

  return {
    message: responseContent?.message || "Sorry, I couldn't understand that.",
    step: responseContent?.step || "",
  };
}
