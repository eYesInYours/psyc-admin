import { request } from "@/utils/service"

/** 获取用户详情 */
export function uplaodApi(rawFile: any) {
  return request<any>({
    url: `/util/upload`,
    method: "post",
    data: rawFile,
    headers: {
      "Content-Type": "multipart/form-data" // 设置请求头为multipart/form-data格式，以便后端接收文件
    }
  })
}
