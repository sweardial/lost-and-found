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
      - "big blue backpack"
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

  console.log({ validationResponse: JSON.parse(response.output_text).status });

  return {
    status: JSON.parse(response.output_text).status,
  };
};

export const validateUserItemLocation = async (userPrompt: string) => {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [{ role: "user", content: userPrompt }],
    instructions: `Your task is to validate a user's description of where they lost an item in the NYC subway system.

    NYC subway locations can be described in various ways, and travelers may have complex paths. Evaluate if the location description is realistic, specific enough to be useful, or too vague.

    Location descriptions should include at least one of:
    - Specific subway line (e.g., "6 train", "A line", "F train")
    - Specific station name (e.g., "Times Square", "Union Square", "Grand Central")
    - Direction/destination (e.g., "heading uptown", "going to Brooklyn", "Queens-bound")
    
    Good examples:
    - "I left it on the F train heading to Queens around 34th Street station"
    - "On the 4 train between Grand Central and Union Square"
    - "Inside the 42nd Street-Bryant Park station near the B/D platform"
    - "On a downtown 6 train somewhere between 77th and 14th street"
    - "At the turnstiles in the 59th Street/Columbus Circle station"
    - "L train heading to Brooklyn after I transferred from the 6"
    - "In the 23rd Street station on the uptown platform for the R/W trains"
    - "Somewhere along my commute from Brooklyn to Midtown, I took the G to the E"

    Bad examples:
    - "In the subway" (too vague)
    - "On a train" (too vague)
    - "Somewhere in Manhattan" (too vague)
    - "On Mars" (unrealistic)
    - "In the secret subway station under Central Park" (unrealistic)
    - "JFK Airport" (not in subway system)
    - "Taxi" (not subway system)
    - "PATH train to New Jersey" (not NYC subway)
    
    You should respond with a JSON object containing the following fields:
    - status: "valid" | "vague" | "unrealistic"
    - feedback: string (brief explanation about why the location is valid, vague, or unrealistic)
    - suggestedQuestion: string (if status is "vague", provide a follow-up question to help the user provide better location details)
    
    valid - the location is specific enough and realistic within NYC subway system
    vague - the location lacks specific details needed for effective search
    unrealistic - the location is not within NYC subway system or is fictional`,
  });

  const parsedResponse = JSON.parse(response.output_text);
  console.log({ validationResponse: parsedResponse });

  return {
    status: parsedResponse.status,
    feedback: parsedResponse.feedback,
    suggestedQuestion: parsedResponse.suggestedQuestion,
  };
};

export const validateUserItemDate = async (userPrompt: string) => {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [{ role: "user", content: userPrompt }],
    instructions: `Your task is to validate a user's description of when they lost an item in the NYC subway system.

    Date and time descriptions should be reasonable and specific enough to help narrow down when the item was lost. The date should be within the last 90 days, as older lost items are unlikely to be recovered.

    Good examples:
    - "Yesterday around 5:30 PM during evening rush hour"
    - "Last Tuesday morning between 8:00 and 9:30 AM"
    - "April 15th around noon"
    - "This morning around 7:45 AM"
    - "Three days ago in the evening, probably between 6 and 8 PM"
    - "Last weekend, Saturday afternoon around 3 PM"
    - "On Monday during my morning commute, so around 8:30 AM"
    - "Two weeks ago on Friday night, after 10 PM"

    Bad examples:
    - "Sometime last year" (too vague and too old)
    - "I don't remember" (too vague)
    - "Tomorrow" (unrealistic - future date)
    - "In 1985" (unrealistic - too old)
    - "The day the aliens landed" (unrealistic)
    - "At the beginning of time" (unrealistic)
    
    You should respond with a JSON object containing the following fields:
    - status: "valid" | "vague" | "unrealistic"
    - feedback: string (brief explanation about why the timing is valid, vague, or unrealistic)
    - suggestedQuestion: string (if status is "vague", provide a follow-up question to help the user provide better timing details)
    
    valid - the timing is specific enough and realistic (within the last 90 days)
    vague - the timing lacks specific details needed for effective search
    unrealistic - the timing is impossible (future date) or too old (over 90 days ago)`,
  });

  const parsedResponse = JSON.parse(response.output_text);
  console.log({ validationResponse: parsedResponse });

  return {
    status: parsedResponse.status,
    feedback: parsedResponse.feedback,
    suggestedQuestion: parsedResponse.suggestedQuestion,
  };
};
