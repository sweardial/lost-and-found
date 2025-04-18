import { getOrCreateAssistant } from "@/lib/assistants/assistant";
import { moderationCheck } from "@/lib/assistants/moderation";
import { handleRunStatus } from "@/lib/assistants/runHandler";
import { createOpenAiThreadMessage, openai } from "@/lib/openai";
import { Flow } from "@prisma/client";

export async function processChatMessage(message: string, context: any) {
  const threadId = context?.threadId || (await openai.beta.threads.create()).id;

  const { flow }: { flow: Flow } = context;

  console.log({ flow });

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

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  const assistant = await getOrCreateAssistant({ flow });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistant.id,
  });

  const messages = await handleRunStatus(run, threadId);

  console.log({ messages });

  return {
    message: "Sorry, I couldn't understand that.", // placeholder
    step: "",
    isInappropriate: false,
    context: { ...context, threadId, lastMessage: message },
  };
}
