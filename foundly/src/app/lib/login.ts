import { sign } from "jsonwebtoken";
import {
  createLoginCodeDB,
  getOrCreateUserByEmailDB,
  getUserByEmailDB,
  getUserByIdDB,
  getValidLoginCodeByUserIdDB,
  updateLoginCodeByIdDB,
} from "../../db";
import { LimitError, NotFoundError, ValidationError } from "./errors";
import { sendEmail } from "./sendEmail";
import { generateRandomSessionId, generateSixDigitCode } from "./utils";
import { JWT_SECRET } from "./envs";

interface HandleEmailConfirmationCodeParams {
  email: string;
}

export const handleEmailLoginCode = async ({
  email,
}: HandleEmailConfirmationCodeParams) => {
  const user = await getOrCreateUserByEmailDB(email);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const existingCode = await getValidLoginCodeByUserIdDB({ userId: user.id });

  if (existingCode) {
    if (existingCode.attempt > 2) {
      throw new LimitError("Maximum attempts reached. Please try again later.");
    }

    await updateLoginCodeByIdDB({
      codeId: existingCode.id,
      data: { expiresAt: new Date() },
    });
  }

  const code = generateSixDigitCode();

  console.log({ code });

  await createLoginCodeDB({
    code,
    userId: user.id,
    ...(existingCode ? { attempt: existingCode.attempt + 1 } : {}),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  // await sendEmail({ email, code });

  return user.id;
};

interface HandleEmailConfirmationCode {
  userId: string;
  code: string;
}

export const handleEmailConfirmationCode = async ({
  userId,
  code,
}: HandleEmailConfirmationCode) => {
  const user = await getUserByIdDB(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const loginCode = await getValidLoginCodeByUserIdDB({ userId });

  if (!loginCode) {
    throw new NotFoundError(
      "No valid login code found. Please request a new code."
    );
  }

  if (loginCode.code !== code) {
    throw new ValidationError("Invalid code. Please try again.");
  }

  await updateLoginCodeByIdDB({
    codeId: loginCode.id,
    data: { expiresAt: new Date(), isUsed: true },
  });

  const sessionId = generateRandomSessionId();
  const expiresIn = 10 * 60; // 10 minutes

  const payload = {
    sessionId,
    userId: user.id,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };

  const token = sign(payload, JWT_SECRET);

  return token;
};
