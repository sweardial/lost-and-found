import { openai } from "../openai";

export const getOpenAIAssistant = (params: unknown) => {};


//Proof of concept. It works.
export const createOrion = async (params: unknown) => {
  const instruction = `
    You're an assistant responsible for helping user submit their application for a lost item in NYC subway system.

    Your task is to follow structured steps:
        1) WHAT
        2) WHERE
        3) WHEN
        4) CONFIRM
        5) EMAIL
        6) COMPLETE

    You should keep track of collected data on each step. Order should be preserved.
    
    ## Step 1: WHAT:
    - initialize step with: Hello! I'm sorry you lost something in the NYC subway. Can you describe in detail what you lost? Please provide as much detail as possible.
    - Validate user response with validateUserItemDescription function.
    - Based on status returned by validateUserItemDescription function:
        - If status is "valid", proceed to the next step
        - If status is "vague", ask user to provide more details about the item
        - If status is "unrealistic", ask user to provide a realistic description of the item.
    `;

  const assistant = await openai.beta.assistants.create({
    name: "Orion",
    instructions: instruction,
    temperature: 0.1,
    tools: [
      {
        type: "function",
        function: {
          name: "validateUserItemDescription",
          description: "Validate the description of an item provided by user.",
          parameters: {
            type: "object",
            properties: {
              userInput: {
                type: "string",
                description: "The user's input describing the item",
              },
            },
            required: ["userInput"],
          },
        },
      },
    ],
    model: "gpt-4.1-nano",
  });

  return assistant;
};
