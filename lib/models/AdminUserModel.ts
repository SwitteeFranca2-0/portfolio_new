import { BaseModel } from './BaseModel'

export class AdminUserModel extends BaseModel {
  static async findByEmail(email: string) {
    return this.db.adminUser.findUnique({ where: { email } })
  }

  static async updatePassword(id: string, passwordHash: string) {
    await this.db.adminUser.update({ where: { id }, data: { password: passwordHash } })
  }

  static async updateEmail(id: string, email: string) {
    await this.db.adminUser.update({ where: { id }, data: { email } })
  }
}
