function requireEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
  return value;
}

export const JWT_SECRET = requireEnv("JWT_SECRET");
export const OPENAI_API_KEY = requireEnv("OPENAI_API_KEY");
export const DATABASE_URL = requireEnv("DATABASE_URL");
export const AWS_REGION = requireEnv("AWS_REGION");
export const AWS_ACCESS_KEY_ID = requireEnv("AWS_ACCESS_KEY_ID");
export const AWS_SECRET_ACCESS_KEY = requireEnv("AWS_SECRET_ACCESS_KEY");
