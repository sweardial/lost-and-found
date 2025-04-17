import { openai } from "./openai";
import { assistantFlows, FlowType } from "./assistantConfig";

export async function createAssistant(flow: FlowType) {
  const instructions = `
    You are an assistant helping users ${
      flow === "lost" ? "report lost items" : "report found items"
    } in NYC Subway.
    Follow these steps: ${Object.keys(assistantFlows[flow]).join(" -> ")}.
    Stay focused on collecting information sequentially and clearly.`;

  const assistant = await openai.beta.assistants.create({
    name: `NYC Subway ${
      flow.charAt(0).toUpperCase() + flow.slice(1)
    } Assistant`,
    instructions,
    model: "gpt-4.1-nano",
    temperature: 0.1,
  });

  return assistant.id;
}
