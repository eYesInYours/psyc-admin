import { request } from "@/utils/service"
import type * as User from "./types/user"
import type * as Login from "../login/types/login"

/** 获取用户详情 */
export function getUserInfoApi(userId: string | number) {
  return request<Login.UserInfoResponseData>({
    url: `/user/info?userId=${userId}`,
    method: "get"
  })
}
