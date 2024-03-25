import { type User } from "../../user/types/user"

export interface LoginRequestData {
  /** admin 或 editor */
  username: "admin" | "editor"
  /** 密码 */
  password: string
  /** 验证码 */
  // code: string,
  /* 登陆类型 */
  type: "STUDENT" | "TEACHER" | "ADMIN"
}

export type LoginCodeResponseData = ApiResponseData<string>

export type LoginResponseData = ApiResponseData<{
  token: string
  user: User
}>

export type UserInfoResponseData = ApiResponseData<{ username: string; roles: string[] }>
