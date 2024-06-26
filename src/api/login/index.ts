import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: "/user/login/code",
    method: "get"
  })
}

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "/user/login",
    method: "post",
    data
  })
}

/** 获取用户详情 */
export function getUserInfoApi(userId: string | number) {
  return request<Login.UserInfoResponseData>({
    url: `/user/info?userId=${userId}`,
    method: "get"
  })
}

/*修改用户*/
export function updaterUserInfoApi(rest: any) {
  return request({
    url: "/user/update",
    method: "post",
    data: rest
  })
}
