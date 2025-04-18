import { openai } from "@/lib/openai";

export async function moderationCheck(message: string): Promise<boolean> {
  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: message,
  });

  return response.results.some((result) => result.flagged);
}
