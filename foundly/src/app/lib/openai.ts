import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ASSISTANT_ID = process.env.ASSISTANT_ID || "default_assistant";

export const createOpenAIAssistant = async ({
  instructions,
  tools,
  temperature,
  model,
}: OpenAI.Beta.Assistants.AssistantCreateParams) => {
  return openai.beta.assistants.create({
    name: "Orion",
    instructions,
    temperature,
    tools,
    model,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "output_schema",
        strict: true,
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            step: {
              type: "string",
            },
          },
          additionalProperties: false,
          required: ["message", "step"],
        },
      },
    },
  });
};

export const createOpenAiThreadMessage = async ({ threadId, role, content }) =>
  openai.beta.threads.messages.create(threadId, {
    role,
    content,
  });
