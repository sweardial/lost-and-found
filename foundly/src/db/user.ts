import { prisma } from './client'

export const createUser = async (email: string) => {
  return prisma.user.create({
    data: { email }
  })
}

export const getUser = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: { Item: true }
  })
}

export const updateUser = async (id: string, email: string) => {
  return prisma.user.update({
    where: { id },
    data: { email }
  })
}

export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id }
  })
}
