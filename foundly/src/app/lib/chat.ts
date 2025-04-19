import { getOrCreateAssistant } from "@/lib/assistants/assistant";
import { moderationCheck } from "@/lib/assistants/moderation";
import { handleRunStatus } from "@/lib/assistants/runHandler";
import { createOpenAiThreadMessage, openai } from "@/lib/openai";
import { Flow } from "@prisma/client";

export async function processChatMessage(message: string, context: any) {
  const threadId = context?.threadId || (await openai.beta.threads.create()).id;

  const { flow }: { flow: Flow } = context;

  const isInappropriate = await moderationCheck(message);
  if (isInappropriate) {
    return {
      message: "Behave!",
      step: "",
      isInappropriate: true,
      context: { ...context, threadId },
    };
  }

  await createOpenAiThreadMessage({ threadId, role: "user", content: message });

  const assistant = await getOrCreateAssistant({ flow });

  if (!assistant) {
    throw new Error("Assistant not found");
  }

  const run = await openai.beta.threads.runs.createAndPoll(
    threadId,
    {
      assistant_id: assistant.id,
    },
    { pollIntervalMs: 2000, maxRetries: 10 }
  );

  const { data } = await handleRunStatus(run, threadId);

  const lastMessage = data.find((msg) => msg.role === "assistant");

  //@ts-expect-error no type for this
  const parsedMessage = JSON.parse(lastMessage?.content[0].text.value);

  console.log({ parsedMessage });

  return {
    message: parsedMessage.message,
    step: parsedMessage.step,
    isInappropriate: false,
    context: { ...context, threadId, lastMessage: message },
  };
}
