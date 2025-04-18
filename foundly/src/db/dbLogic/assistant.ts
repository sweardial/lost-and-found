import { Flow } from '@/generated/prisma'
import { prisma } from '../client'

export const createAssistant = async (id: string, name: string, flow: Flow, version: number) => {
  return prisma.assistant.create({
    data: { id, name, flow, version }
  })
}

export const getAssistant = async (id: string) => {
  return prisma.assistant.findUnique({
    where: { id }
  })
}

export const updateAssistant = async (id: string, data: { name?: string; flow?: Flow; version?: number }) => {
  return prisma.assistant.update({
    where: { id },
    data
  })
}

export const deleteAssistant = async (id: string) => {
  return prisma.assistant.delete({
    where: { id }
  })
}
