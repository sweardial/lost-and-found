import {
  validateUserItemDate,
  validateUserItemDescription,
  validateUserItemLocation,
} from "@/lib/assistants/validations";
import { openai } from "@/lib/openai";
import { PagePromise } from "openai/core.mjs";
import {
  Message,
  MessagesPage,
} from "openai/resources/beta/threads/messages.mjs";
import { Run } from "openai/resources/beta/threads/runs/runs.mjs";

const mapper = {
  validateUserItemDescription: validateUserItemDescription,
  validateUserItemLocation: validateUserItemLocation,
  validateUserItemDate: validateUserItemDate,
};

export async function handleRunStatus(
  run: Run,
  threadId: string
): Promise<PagePromise<MessagesPage, Message>> {
  if (run.status === "completed") {
    return openai.beta.threads.messages.list(threadId);
  } else if (run.status === "requires_action") {
    return handleRequiresAction(run, threadId);
  } else {
    console.error("Unhandled run status:", run.status);
    throw new Error();
  }
}

async function handleRequiresAction(run: Run, threadId: string) {
  const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls || [];

  const toolOutputs = await Promise.all(
    toolCalls.map(async (tool) => {
      const userItem = JSON.parse(tool.function.arguments).userInput;

      const handler = mapper[tool.function.name];

      if (!handler) {
        throw new Error(`No handler found for tool: ${tool.function.name}`);
      }

      const validationResult = await handler(userItem);

      const object = {
        tool_call_id: tool.id,
        output: JSON.stringify(validationResult),
      };

      return object;
    })
  );

  if (!toolOutputs.length) {
    throw Error("No valid tool outputs found");
  }

  const toolRun = await openai.beta.threads.runs.submitToolOutputsAndPoll(
    threadId,
    run.id,
    { tool_outputs: toolOutputs },
    {
      maxRetries: 5,
      pollIntervalMs: 2000,
      timeout: 10000,
    }
  );

  return handleRunStatus(toolRun, threadId);
}
