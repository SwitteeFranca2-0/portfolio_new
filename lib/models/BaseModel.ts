/**
 * BaseModel — the DB gateway.
 * Owns the Prisma client. All models extend this class.
 * No file outside lib/models/ should ever import prisma directly.
 */
import { prisma } from '@/lib/prisma'

export class BaseModel {
  protected static get db() {
    return prisma
  }
}
