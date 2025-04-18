import { createAssistantDB, getCurrentAssistantByFlowDB } from "../../../db";
import { Flow } from "../../../generated/prisma";
import { createOpenAIAssistant, openai } from "../openai";
import { ORION_MODEL, ORION_PROMPT, ORION_TOOLS } from "./config";

export const getOrCreateAssistantId = async ({ flow }: { flow: Flow }) => {
  const assistant = await getCurrentAssistantByFlowDB({ flow });

  if (assistant) {
    return assistant.id;
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
    name: "Orion",
    flow,
    version: 1.0,
    isCurrentVersion: true,
  });

  return newAssistant.id;
};
