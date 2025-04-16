interface JsonExtraction {
  jsonData: any | null;
  cleanMessage: string;
}

export const extractJsonFromMessage = (message: string): JsonExtraction => {
  let jsonData = null;
  let cleanMessage = message;

  try {
    const jsonMatch = message.match(/```json\s*({[\s\S]*?})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonData = JSON.parse(jsonMatch[1]);
      cleanMessage = message.replace(/```json\s*{[\s\S]*?}\s*```/, "").trim();
    }
  } catch (e) {
    console.error("Error parsing JSON from message:", e);
  }

  return { jsonData, cleanMessage };
};
