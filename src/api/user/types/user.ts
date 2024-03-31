export interface User {
  id: number | string | undefined
  username: string
  nickname?: string
  type: "STUDENT" | "TEACHER" | "ADMIN" | ""
  phone?: String
  intro?: String
  createTime?: String
  updateTime?: String
  avatar?: String
  roles?: Array<string> // 权限
  officeIds?: Array<string>
  officeNames?: Array<string>
}
