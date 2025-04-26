import { LoginCodes } from "@prisma/client";
import { prisma } from "../client";

interface CreateLoginCodeDBParams {
  userId: string;
  code: string;
  attempt?: number;
  expiresAt: Date;
}

export const createLoginCodeDB = async (data: CreateLoginCodeDBParams) =>
  prisma.loginCodes.create({
    data,
  });

interface DetValidLoginCodeByUserIdParams {
  userId: string;
}

export const getValidLoginCodeByUserIdDB = async ({
  userId,
}: DetValidLoginCodeByUserIdParams) =>
  prisma.loginCodes.findFirst({
    where: {
      userId,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

interface updateLoginCodeByIdDBParams {
  codeId: string;
  data: Partial<LoginCodes>;
}
export const updateLoginCodeByIdDB = async ({
  codeId,
  data,
}: updateLoginCodeByIdDBParams) =>
  prisma.loginCodes.update({ where: { id: codeId }, data });
