import { request } from "@/utils/service"
import type * as Table from "./types/table"

/** 增 */
export function createCommentTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "/comment/post",
    method: "post",
    data
  })
}

/** 改 */
export function updateCommentTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "/comment/update",
    method: "put",
    data
  })
}

/** 删 */
export function deleteCommentTableDataApi(_id: string) {
  return request({
    url: `/comment/del/${_id}`,
    method: "delete"
  })
}

/** 查 */
export function getCommentTableDataApi(params: Table.GetTableRequestData) {
  return request<Table.GetTableResponseData>({
    url: "/comment/list",
    method: "get",
    params
  })
}

/* 详情 */
export function getCommentDetailApi(params: any) {
  return request<Table.GetTableResponseData>({
    url: "/comment/detail",
    method: "get",
    params
  })
}
