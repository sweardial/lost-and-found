import { ItemEventType, ItemStatus } from '../../generated/prisma'
import { prisma } from '../client'

export const createItem = async (data: {
  name: string
  eventType: ItemEventType
  status: ItemStatus
  description: string
  event_location: string
  event_occurred_at: Date
  last_matching_attempt_at: Date
  userId: string
}) => {
  return prisma.item.create({ data })
}

export const getItem = async (id: string) => {
  return prisma.item.findUnique({
    where: { id },
    include: { user: true }
  })
}

export const updateItem = async (id: string, data: Partial<Omit<typeof prisma.item.create, 'id'>>) => {
  return prisma.item.update({
    where: { id },
    data
  })
}

export const deleteItem = async (id: string) => {
  return prisma.item.delete({
    where: { id }
  })
}
