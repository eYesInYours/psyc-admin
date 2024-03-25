export interface User {
  id: number
  username: string
  nickname?: string
  type: "STUDENT" | "TEACHER" | "ADMIN"
  phone: String
  intro: String
  createTime: String
  updateTime: String
  avatar: String
  roles: Array<string> // 权限
}
