import { Item } from "@prisma/client";
import { prisma } from "../client";

export const createItem = async (data: Item) => {
  return prisma.item.create({ data });
};

export const getItem = async (id: string) => {
  return prisma.item.findUnique({
    where: { id },
    include: { user: true },
  });
};

export const updateItem = async (
  id: string,
  data: Partial<Omit<typeof prisma.item.create, "id">>
) => {
  return prisma.item.update({
    where: { id },
    data,
  });
};

export const deleteItem = async (id: string) => {
  return prisma.item.delete({
    where: { id },
  });
};
