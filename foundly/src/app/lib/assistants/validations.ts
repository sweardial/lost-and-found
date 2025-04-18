import { openai } from "../openai";

export const validateUserItemDescription = async (userPrompt: string) => {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [{ role: "user", content: userPrompt }],
    instructions: `Your task is to validate user prompt.

      You should identify if user prompt is a description of a physical item that can be lost/found in NYC subway system.
      The description should be sufficiently detailed and realistic.

      Good examples:
      - "black leather Coach wallet with golden zipper and red stripe detail on the side"
      - "dark blue JanSport backpack with yellow zipper pulls and reflective strip across front pocket"
      - "collapsible black and red Totes umbrella with automatic opening button and rubber grip handle"
      - "Sony WH-1000XM4 wireless headphones in black with silver accents and worn ear cushions"
      - "32oz mint green Hydro Flask water bottle with flip lid and NYC skyline sticker"
      - "white gold ring with oval sapphire stone surrounded by small diamonds"
      - "Ray-Ban rectangular glasses with black acetate frames and silver temple details"
      - "red and white cashmere scarf from Uniqlo with traditional snowflake pattern"

      Bad examples:
      - "pet dragon."
      - "red scarf."
      - "black wallet"
      - "unicorn"
      - "wallet."
      - "spaceship."
      - "phone."
      - "time machine."
      - "virginity."
      - "treasure map."
      - "mind."
      - "magic wand."
      - "car."
      - "dinosaur."
      - "job."
      - "money."
      - "scarf"

      You should respond with a JSON object containing the following field:
      - status: "valid" | "vague" | "unrealistic"

      valid - the description is detailed and realistic
      vague - the description is too vague or general
      unrealistic - the description is unrealistic or not a physical item
      `,
  });

  console.log({ response });

  return {
    status: "vague",
  };
};

export const validateUserLostItemLocation = () => {};
export const validateUserLostItemDate = () => {};
export const validateUserLostItemEmail = () => {};
export const validateUserLostItemConfirmation = () => {};

export const validateUserFoundItemDescription = () => {};
export const validateUserFoundItemLocation = () => {};
export const validateUserFoundItemDate = () => {};
export const validateUserFoundItemEmail = () => {};
export const validateUserFoundItemConfirmation = () => {};
