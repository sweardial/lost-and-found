import { createAssistantDB, getCurrentAssistantByFlowDB } from "../../../db";
import { Flow } from "@prisma/client";
import { createOpenAIAssistant } from "../openai";
import { ORION_MODEL, ORION_PROMPT, ORION_TOOLS } from "./config";

export const getOrCreateAssistant = async ({ flow }: { flow: Flow }) => {
  const assistant = await getCurrentAssistantByFlowDB({ flow });

  if (assistant) {
    return assistant;
  }

  const newAssistant = await createOpenAIAssistant({
    temperature: 0.1,
    name: "Orion",
    tools: ORION_TOOLS,
    instructions: ORION_PROMPT,
    model: ORION_MODEL,
  });

  await createAssistantDB({
    id: newAssistant.id,
    name: newAssistant.name as string,
    flow,
    //@ts-expect-error number
    version: 1.1,
    isCurrentVersion: true,
    description: newAssistant.description as string,
    model: newAssistant.model,
    instructions: newAssistant.instructions as string,
    tools: newAssistant.tools as object,
    metadata: newAssistant.metadata,
    top_p: newAssistant.top_p as number,
    temperature: newAssistant.temperature as number,
    response_format: newAssistant.response_format as string,
  });

  return newAssistant;
};
