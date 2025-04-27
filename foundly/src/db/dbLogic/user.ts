import { prisma } from "../client";

export const createUser = async (email: string) => {
  return prisma.user.create({
    data: { email },
  });
};

export const getOrCreateUserByEmailDB = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    return user;
  }

  return prisma.user.create({
    data: { email },
  });
};

export const getUserByEmailDB = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const updateUser = async (id: string, email: string) => {
  return prisma.user.update({
    where: { id },
    data: { email },
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};
