import { openai } from "../openai";

export const validateUserItemDescription = async (userPrompt: string) => {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [{ role: "user", content: userPrompt }],
    instructions: `
      Your task is to validate a user's description of a lost or found physical item in the NYC subway system.

      RULES YOU MUST FOLLOW:
      - Focus only on physical, realistic items that can reasonably be lost or found.
      - Do not accept imaginary, abstract, or unrealistic descriptions.
      - Do not guess missing item details — evaluate strictly based on user input.

      TASKS:
      1. Assess whether the user's input describes:
          - A specific, realistic, physical item (valid)
          - A real item but described too vaguely (vague)
          - Something unrealistic, abstract, or impossible (unrealistic)

      2. If vague:
          - Suggest a clarifying question asking for missing details (e.g., brand, color, size, features).

      3. If unrealistic:
          - Explain briefly why the input is unrealistic.

      OUTPUT:
      You MUST respond in the following JSON format:
      {
        "status": "valid" | "vague" | "unrealistic",
        "feedback": "short explanation of why the input was rated this way",
        "suggestedQuestion": "question to clarify details about the items" (only if status is vague. Questions should be related to the item type)
      }

      EXAMPLES:

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
    model: "gpt-4.1",
    input: [{ role: "user", content: userPrompt }],
    tools: [
      {
        type: "file_search",
        vector_store_ids: [process.env.NYC_SUBWAY_GRID_VECTOR_STORE_ID || ""],
      },
    ],
    instructions: `You are responsible for validating a user's description of where they lost an item within the NYC subway system.
      
    Your goal is to extract location-specific information from the user's message in order to help identify where the item may have been lost — whether on a train, at a station, or during a transfer.
    
    You have access to a vector database containing:
    - All NYC subway stations, and which train lines serve each station.
    - All NYC subway lines, with the ordered list of stations on each line.
    
    ---
    
    RULES YOU MUST FOLLOW:
    
    1. NO HALLUCINATION:
       - You MUST ONLY extract subway lines and stations that are explicitly mentioned in the user input.
       - DO NOT guess or infer information that the user has not directly stated.
       - NEVER include stations or directions unless they are either:
         a) explicitly mentioned, or  
         b) directly derivable from multiple stations being named.
    
    2. VECTOR STORE USAGE:
       - You MAY use the vector store to:
         - Validate that mentioned stations and lines exist.
         - Determine if stations lie on the same line and in what order.
         - Derive trip direction based on station order if both origin and destination are provided.
         - Determine valid transfer stations between lines mentioned in the input.
       - DO NOT use vector store to introduce new entities not referenced in the user input.
    
    3. ENTITY MATCHING:
       - All stations and lines in your output MUST be explicitly present in the user input.
       - If a mentioned entity is not found in the vector database, treat it as invalid.
    
    ---
        
    CLASSIFICATION DEFINITIONS:
    
    - status: "valid  
      - A specific station name (e.g., “lost it at 14th Street–Union Square”)
      - A train trip bounded by two verifiable stations (e.g., “from Delancey to West 4th”)
      - A directional trip on a line with one known endpoint (e.g., “on the D train heading downtown from 59th”)
      - A known transfer area between valid lines or stations (e.g., “switched from the N to the 1 at Times Square”)
      - A description that includes a train line and a station (e.g., “on the A train at Hoyt-Schermerhorn”)

    
    - status: "vague" 
      If only general areas or train lines without context.
    
    - status: "unrealistic  
      If any part of the input refers to a non-existent station, line, or location outside the NYC subway system (e.g. "on Mars" or "Hogwarts").
    
    ---
    
    LOCATION TYPE VALUES:
    
    - station if user was at a fixed subway station
    - train_trip if the user was on a train, with at least two stations
    - transfer_area if the user mentioned switching between lines
    - unknown if unclear or missing necessary data
    
    ---
    
    FEEDBACK:
    
    Always include a short, informative explanation justifying the classification.  
    If the input is vague, include a useful 'suggestedQuestion' to clarify
    
    ---
    
    EXAMPLES:
    
    User Input: "Lost it on the F train between Delancey and West 4th Street"
    - status: "valid"
    - parsed_entities: { "lines": ["F"], "stations": ["Delancey Street/Essex Street", "West Fourth Street–Washington Square"] }
    
    User Input: "Lost somewhere around Brooklyn"
    - status: "vague"
    - parsed_entities: { "lines": [], "stations": [] }
    
    User Input: "train 6"
    - status: "vague"
    - parsed_entities: { "lines": ["6"], "stations": [] }
    
    User Input: "Lost it at Hogwarts Station"
    - status: "unrealistic"
    - parsed_entities: { "lines": [], "stations": [] }
    
    ---
    
    OUTPUT FORMAT:
    
    Respond ONLY in the following JSON format:
    {
      "status": "valid" | "vague" | "unrealistic",
      "parsed_entities": {
        "lines": ["..."], 
        "stations": ["..."]
      },
      "feedback": "short explanation",
    }
    `,
  });

  //pink birkin bag with leopard print

  const parsedResponse = JSON.parse(response.output_text);

  console.log({ validationResponse: parsedResponse });

  return {
    status: parsedResponse.status,
    location_type: parsedResponse.location_type,
    parsed_entities: parsedResponse.parsed_entities,
    feedback: parsedResponse.feedback,
  };
};

export const validateUserItemDate = async (userPrompt: string) => {
  const date = new Date();

  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [{ role: "user", content: userPrompt }],
    instructions: `Your task is to validate a user's description of when they lost an item in the NYC subway system.

    Today date is ${date.toISOString()}.

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
