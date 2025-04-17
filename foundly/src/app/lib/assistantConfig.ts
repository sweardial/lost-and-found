export type FlowType = "lost" | "found";
export type StageType = "WHAT" | "WHERE" | "WHEN" | "CONFIRM" | "EMAIL" | "COMPLETE";

interface AssistantStep {
  prompt: string;
  validate?: (input: string) => boolean;
  errorPrompt?: string;
}

interface AssistantFlow {
  [key: string]: AssistantStep;
}

export const assistantFlows: Record<FlowType, AssistantFlow> = {
  lost: {
    WHAT: {
      prompt:
        "Hello! I'm sorry you lost something in the NYC subway. Can you describe in detail what you lost? Please provide as much detail as possible.",
      validate: (input) => input.length > 15,
      errorPrompt: "Could you add more specific details about the item?",
    },
    WHERE: {
      prompt: "Do you remember where in the NYC subway system you last saw it?",
      validate: (input) => input.length > 10,
      errorPrompt: "Please provide more specific location details.",
    },
    WHEN: {
      prompt: "When did you lose the item? (MM/DD/YYYY at HH:MM)",
      validate: (input) => /\d{2}\/\d{2}\/\d{4}\sat\s\d{2}:\d{2}/.test(input),
      errorPrompt: "Please use the exact date and time format provided.",
    },
    // continue similarly for CONFIRM, EMAIL, COMPLETE...
  },
  found: {
    WHAT: {
      prompt: "Hello! Thank you for helping. Can you describe what you found?",
      validate: (input) => input.length > 15,
      errorPrompt: "Could you add more specific details about the found item?",
    },
    // continue similarly...
  },
};
