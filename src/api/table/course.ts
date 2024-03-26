import { request } from "@/utils/service"
import type * as Table from "./types/table"

/** 增 */
export function createTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "/course/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteTableDataApi(id: string) {
  return request({
    url: `/course/del/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "/course/update",
    method: "put",
    data
  })
}

/** 查 */
export function getTableDataApi(params: Table.GetTableRequestData) {
  return request<Table.GetTableResponseData>({
    url: "/course/list",
    method: "get",
    params
  })
}
