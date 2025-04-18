import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
import { createOrion } from "@/app/lib/assistants/assistant";
import { validateUserItemDescription } from "@/app/lib/assistants/validations";

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

  const assistant = await createOrion({});

  let run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistant.id,
  });

  while (
    run.status !== "completed" &&
    run.status !== "requires_action" &&
    run.status !== "failed" &&
    run.status !== "cancelled"
  ) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    run = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  const messages = await handleRunStatus(run, threadId);

  return {
    message: "Sorry, I couldn't understand that.",
    step: "",
  };

  // const lastMessage = messages.data.find((msg) => msg.role === "assistant");

  // let responseContent: { message: string; step: string } | null;
  // try {
  //   //@ts-expect-error type is not defined
  //   const contentText = JSON.parse(lastMessage?.content[0].text.value) as {
  //     message: string;
  //     step: string;
  //   };
  //   responseContent = contentText || null;
  // } catch (error) {
  //   console.error("Error parsing assistant response:", error);
  //   responseContent = null;
  // }

  // console.log({ responseContent });

  // return {
  //   message: responseContent?.message || "Sorry, I couldn't understand that.",
  //   step: responseContent?.step || "",
  // };
}

const handleRequiresAction = async (run, treadId) => {
  if (
    run.required_action &&
    run.required_action.submit_tool_outputs &&
    run.required_action.submit_tool_outputs.tool_calls
  ) {
    const toolOutputs = run.required_action.submit_tool_outputs.tool_calls.map(
      (tool) => {
        if (tool.function.name === "validateUserItemDescription") {
          return {
            tool_call_id: tool.id,
            output: JSON.stringify(
              validateUserItemDescription(
                JSON.parse(tool.function.arguments).userInput
              )
            ),
          };
        }
      }
    );

    // Submit all tool outputs at once after collecting them in a list
    if (toolOutputs.length > 0) {
      run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
        treadId,
        run.id,
        { tool_outputs: toolOutputs }
      );
      console.log("Tool outputs submitted successfully.");
    } else {
      console.log("No tool outputs to submit.");
    }

    // Check status after submitting tool outputs
    return handleRunStatus(run, treadId);
  }
};

const handleRunStatus = async (run, treadId) => {
  if (run.status === "completed") {
    console.log("STATUS COMPLETED");
    const messages = await openai.beta.threads.messages.list(treadId);
    return messages.data;
  } else if (run.status === "requires_action") {
    console.log("REQUIRED ACTION", run);
    return await handleRequiresAction(run, treadId);
  } else {
    console.error("Run did not complete:", run);
  }
};
