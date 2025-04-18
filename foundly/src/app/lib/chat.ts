import { createOpenAiThreadMessage, openai } from "@/lib/openai";
import { getOrCreateAssistantId } from "@/lib/assistants/assistant";
import { handleRunStatus } from "@/lib/assistants/runHandler";
import { moderationCheck } from "@/lib/assistants/moderation";

export async function processChatMessage(message: string, context: any) {
  const threadId = context?.threadId || (await openai.beta.threads.create()).id;

  const { flow } = context;

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

  const assistantId = await getOrCreateAssistantId({ flow });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  const messages = await handleRunStatus(run, threadId);

  return {
    message: "Sorry, I couldn't understand that.", // placeholder
    step: "",
    isInappropriate: false,
    context: { ...context, threadId, lastMessage: message },
  };
}
