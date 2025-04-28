import {
  createLoginCodeDB,
  getOrCreateUserByEmailDB,
  getUserByEmailDB,
  getValidLoginCodeByUserIdDB,
  updateLoginCodeByIdDB,
} from "../../db";
import { LimitError, NotFoundError, ValidationError } from "./errors";
import { sendEmail } from "./sendEmail";
import { generateSixDigitCode } from "./utils";

interface SendEmailConfirmationCodeParams {
  email: string;
}

export const sendEmailConfirmationCode = async ({
  email,
}: SendEmailConfirmationCodeParams) => {
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

  const createdCode = await createLoginCodeDB({
    code,
    userId: user.id,
    ...(existingCode ? { attempt: existingCode.attempt + 1 } : {}),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  await sendEmail({ email, code });

  return createdCode;
};

interface VerifyEmailConfirmationCodeParams {
  email: string;
  code: string;
}

export const verifyEmailConfirmationCode = async ({
  email,
  code,
}: VerifyEmailConfirmationCodeParams) => {
  const user = await getUserByEmailDB(email);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const loginCode = await getValidLoginCodeByUserIdDB({ userId: user.id });

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
};
