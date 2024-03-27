import { type User } from "@/api/user/types/user"

export interface CreateOrUpdateTableRequestData extends User {
  username: string
  password?: string
  phone?: string
  intro?: string
  location?: string
  capacity?: number
  rooms?: Array<{
    doorPlate: string
    capacity: number
  }>
}

export interface GetTableRequestData {
  /** 当前页码 */
  pageNum: number
  /** 查询条数 */
  pageSize: number
  /** 查询参数：用户名 */
  username?: string
  /** 查询参数：手机号 */
  phone?: string
  type?: string
  location?: string
}

export interface GetTableData extends User {
  username: string
  password?: string
  phone?: string
  intro?: string
  location?: string
  rooms?: Array<{
    doorPlate: string
    capacity: number
  }>
}

export type GetTableResponseData = ApiResponseData<{
  list: GetTableData[]
  total: number
}>
