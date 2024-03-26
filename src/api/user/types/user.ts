export interface User {
  id: number | string | undefined
  username: string
  nickname?: string
  type: "STUDENT" | "TEACHER" | "ADMIN" | undefined
  phone?: String
  intro?: String
  createTime?: String
  updateTime?: String
  avatar?: String
  roles?: Array<string> // 权限
  teacherOffice?: string // 老师科室
}
