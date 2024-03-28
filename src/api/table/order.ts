import { request } from "@/utils/service"
import type * as Table from "../table/types/table"

/** 增 */
export function createTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "/classroom/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteTableDataApi(id: string) {
  return request({
    url: `/classroom/del/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "/classroom/update",
    method: "put",
    data
  })
}

/** 查 */
export function getTableDataApi(params: Table.GetTableRequestData) {
  return request<Table.GetTableResponseData>({
    url: "/order/list",
    method: "get",
    params
  })
}

export function searchTableDataApi(keyword?: string) {
  return request<Table.GetTableResponseData>({
    url: `/classroom/search?keyword=${keyword}`,
    method: "get"
  })
}

/** 预约 */
export function createAppointOrder(data: Table.CreateOrUpdateTableRequestData) {
  return request<Table.GetTableResponseData>({
    url: "/order/create",
    method: "post",
    data
  })
}
