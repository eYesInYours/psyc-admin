import { request } from "@/utils/service"
import type * as Table from "../table/types/table"

/** 查 */
export function getTableDataApi(params: Table.GetTableRequestData) {
  return request<Table.GetTableResponseData>({
    url: "/appoint/list",
    method: "get",
    params
  })
}
