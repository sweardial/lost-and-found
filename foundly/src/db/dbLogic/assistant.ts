import { Flow } from "@/../generated/prisma";
import { prisma } from "../client";

export const createAssistantDB = async ({
  id,
  name,
  flow,
  version,
  isCurrentVersion,
}: {
  id: string;
  name: string;
  flow: Flow;
  version: number;
  isCurrentVersion: boolean;
}) => {
  return prisma.assistant.create({
    data: { id, name, flow, version, isCurrentVersion },
  });
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
