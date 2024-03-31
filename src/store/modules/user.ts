import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { useTagsViewStore } from "./tags-view"
import { useSettingsStore } from "./settings"
import { getToken, removeToken, setToken } from "@/utils/cache/cookies"
import { resetRouter } from "@/router"
import { loginApi, getUserInfoApi } from "@/api/login"
import { type LoginRequestData } from "@/api/login/types/login"
import { type User } from "@/api/user/types/user"
import routeSettings from "@/config/route"
import { ElNotification } from "element-plus"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")
  const roles = ref<string[]>([])
  const username = ref<string>("")
  const user = ref<User>({
    id: 0,
    username: "",
    type: "",
    phone: "",
    intro: "",
    createTime: "",
    updateTime: "",
    avatar: "",
    roles: [""] // 权限
  })
  const loginType = ref<string>()

  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** 登录 */
  const login = async ({ username, password, type }: LoginRequestData) => {
    loginType.value = type
    const { data } = await loginApi({ username, password, type })
    setToken(data.token)
    token.value = data.token
    user.value = data.user
    console.log("user token", data.token, user.value)
  }
  /** 获取用户详情 */
  const getInfo = async () => {
    const { data } = await getUserInfoApi(token.value)
    username.value = data.username
    // 验证返回的 roles 是否为一个非空数组，否则塞入一个没有任何作用的默认角色，防止路由守卫逻辑进入无限循环
    console.log("data", data)
    user.value = data
    roles.value = data.roles?.length > 0 ? data.roles : routeSettings.defaultRoles

    let title = ""
    switch (data.type) {
      case "TEACHER":
        title = `教师【${data.username}】，欢迎登录。`
        break
      case "STUDENT":
        title = `学生【${data.username}】，欢迎登录。`
        break
      case "ADMIN":
        title = "欢迎登录，您是超级管理员，有权进行任意管理操作。"
    }
    console.log(title)
    ElNotification({
      title: "Hello",
      type: "success",
      dangerouslyUseHTMLString: true,
      message: title,
      duration: 0,
      position: "bottom-right"
    })
  }
  /** 模拟角色变化 */
  const changeRoles = async (role: string) => {
    const newToken = "token-" + role
    token.value = newToken
    setToken(newToken)
    // 用刷新页面代替重新登录
    window.location.reload()
  }
  /** 登出 */
  const logout = () => {
    removeToken()
    token.value = ""
    roles.value = []
    resetRouter()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    removeToken()
    token.value = ""
    roles.value = []
  }
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return { token, roles, username, login, getInfo, changeRoles, logout, resetToken, user, loginType }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
