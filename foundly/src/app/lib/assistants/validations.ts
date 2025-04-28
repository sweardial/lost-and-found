import { openai } from "../openai";

export const validateUserItemDescription = async (userPrompt: string) => {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [{ role: "user", content: userPrompt }],
    instructions: `
      Your task is to validate a user's description of a lost or found physical item in the NYC subway system.

      **RULES YOU MUST FOLLOW:**
      - Focus only on physical, realistic items that can reasonably be lost or found.
      - Do not accept imaginary, abstract, or unrealistic descriptions.
      - Do not guess missing item details — evaluate strictly based on user input.

      **TASKS:**
      1. Assess whether the user's input describes:
          - A specific, realistic, physical item (valid)
          - A real item but described too vaguely (vague)
          - Something unrealistic, abstract, or impossible (unrealistic)

      2. If vague:
          - Suggest a clarifying question asking for missing details (e.g., brand, color, size, features).

      3. If unrealistic:
          - Explain briefly why the input is unrealistic.

      **OUTPUT:**
      You MUST respond in the following JSON format:
      {
        "status": "valid" | "vague" | "unrealistic",
        "feedback": "short explanation of why the input was rated this way",
        "suggestedQuestion": "question to clarify details about the items" (only if status is vague. Questions should be related to the item type)
      }

      **EXAMPLES:**

      User Input: "black leather Coach wallet with golden zipper and red stripe detail"
      - status: "valid"
      - feedback: "Detailed description of a realistic item."

      User Input: "red scarf"
      - status: "vague"
      - feedback: "Description too vague to identify the item precisely."
      - suggestedQuestion: "Can you describe any patterns, brand names, or additional details about the scarf?"

      User Input: "time machine"
      - status: "unrealistic"
      - feedback: "A time machine is not a realistic physical item one can lose in the NYC subway."

      SOME MORE EXAMPLES:
      
      Good:
      - "black leather Coach wallet with golden zipper and red stripe detail on the side"
      - "dark blue JanSport backpack with yellow zipper pulls and reflective strip across front pocket"
      - "collapsible black and red Totes umbrella with automatic opening button and rubber grip handle"
      - "Sony WH-1000XM4 wireless headphones in black with silver accents and worn ear cushions"
      - "32oz mint green Hydro Flask water bottle with flip lid and NYC skyline sticker"
      - "white gold ring with oval sapphire stone surrounded by small diamonds"
      - "Ray-Ban rectangular glasses with black acetate frames and silver temple details"
      - "red and white cashmere scarf from Uniqlo with traditional snowflake pattern" 

      Bad:
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

      Respond strictly using only the provided structure.`,
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
    tools: [
      {
        type: "file_search",
        vector_store_ids: [process.env.NYC_SUBWAY_GRID_VECTOR_STORE_ID || ""],
      },
    ],
    instructions: `
    You are responsible for validating a user's description of where they lost an item within the NYC subway system.

    **RULES YOU MUST FOLLOW:**
    - You MUST ONLY use information retrieved from the vector database. Do not guess missing information.
    - You MUST match any station names, train lines, and routes directly from the database.
    - If a station or line is not found in the database, treat it as invalid or vague.
    - Never assume or invent stations, lines, or routes.

    **TASKS:**
    1. Search the database based on the user's input.
    2. Extract and list:
        - Subway lines mentioned
        - Stations mentioned
        - If possible, describe the type of location:
          - "station" (if stationary at a known station)
          - "train_trip" (if between stations or moving)
          - "transfer_area" (if describing a transfer between lines)
          - "unknown" (if user is unsure)

    3. Assess location realism:
        - "valid" if matching known subway entities and description is sufficient enough.
        - "vague" if general areas (like "Brooklyn") are given without enough detail.
        - "unrealistic" if not in NYC subway (e.g., "on Mars", "PATH train").

    4. Provide:
        - A short feedback explanation.
        - If vague, suggest specific clarifying questions to help the user provide more useful detail. 

    **OUTPUT:**
    You MUST respond in the following JSON format:
    {
      "status": "valid" | "vague" | "unrealistic",
      "location_type": "station" | "train_trip" | "transfer_area" | "unknown",
      "parsed_entities": {
        "lines": ["..."], 
        "stations": ["..."]
      },
      "feedback": "short explanation",
      "suggestedQuestion": "question to clarify" (only if status is vague)
    }

    **EXAMPLES:**

    User Input: "Lost it on the F train between Delancey and West 4th Street"
    - status: "valid"
    - location_type: "train_trip"
    - parsed_entities: { "lines": ["F"], "stations": ["Delancey Street/Essex Street", "West Fourth Street–Washington Square"] }

    User Input: "Lost somewhere around Brooklyn"
    - status: "vague"
    - location_type: "unknown"
    - parsed_entities: { "lines": [], "stations": [] }
    - suggestedQuestion: "Can you recall which train line you were riding or any station names you passed?"

    User Input: "Lost it at Hogwarts Station"
    - status: "unrealistic"
    - location_type: "unknown"
    - parsed_entities: { "lines": [], "stations": [] }

    Be strict. Do not infer beyond retrieved NYC subway data.
`,
  });

  const parsedResponse = JSON.parse(response.output_text);
  console.log({ validationResponse: parsedResponse });

  return {
    status: parsedResponse.status,
    location_type: parsedResponse.location_type,
    parsed_entities: parsedResponse.parsed_entities,
    feedback: parsedResponse.feedback,
    suggestedQuestion: parsedResponse.suggestedQuestion || null,
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
