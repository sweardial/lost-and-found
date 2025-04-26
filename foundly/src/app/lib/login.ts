import {
  createLoginCodeDB,
  getOrCreateUserByEmail,
  getValidLoginCodeByUserIdDB,
  updateLoginCodeByIdDB,
} from "../../db";
import { generateSixDigitCode } from "./utils";

interface HandleLoginCodeParams {
  email: string;
}

export const handleLoginCode = async ({ email }: HandleLoginCodeParams) => {
  const user = await getOrCreateUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const existingCode = await getValidLoginCodeByUserIdDB({ userId: user.id });

  if (existingCode) {
    if (existingCode.attempt >= 3) {
      return false;
    }

    await updateLoginCodeByIdDB({
      codeId: existingCode.id,
      data: { expiresAt: new Date() },
    });
  }

  const code = generateSixDigitCode();

  const createdCode = await createLoginCodeDB({
    code,
    userId: user.id,
    ...(existingCode ? { attempt: existingCode.attempt + 1 } : {}),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  return createdCode;
};
