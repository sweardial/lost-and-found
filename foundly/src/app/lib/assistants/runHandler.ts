import { openai } from "@/lib/openai";
import { validateUserItemDescription } from "@/lib/assistants/validations";

export async function handleRunStatus(run, threadId) {
  if (run.status === "completed") {
    return await openai.beta.threads.messages.list(threadId);
  } else if (run.status === "requires_action") {
    return await handleRequiresAction(run, threadId);
  } else {
    console.error("Run did not complete:", run);
    return [];
  }
}

async function handleRequiresAction(run, threadId) {
  const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls || [];

  const toolOutputs = toolCalls
    .map((tool) => {
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
    })
    .filter(Boolean);

  if (toolOutputs.length > 0) {
    run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
      threadId,
      run.id,
      { tool_outputs: toolOutputs }
    );
    return await handleRunStatus(run, threadId);
  }

  return [];
}
