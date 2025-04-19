import { Assistant, Flow } from "@prisma/client";
import { prisma } from "../client";

export const createAssistantDB = async (data: Assistant) => {
  //@ts-expect-error fix later
  return prisma.assistant.create({ data});
};

export const getCurrentAssistantByFlowDB = async ({ flow }: { flow: Flow }) => {
  return prisma.assistant.findFirst({
    where: { flow, isCurrentVersion: true },
  });
};

export const updateAssistantByIdDB = async (
  id: string,
  data: { name?: string; flow?: Flow; version?: number }
) => {
  return prisma.assistant.update({
    where: { id },
    data,
  });
};

export const deleteAssistantByIdDB = async (id: string) => {
  return prisma.assistant.delete({
    where: { id },
  });
};
