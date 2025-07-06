// API 响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: string
}

// 分页响应类型
export interface PaginatedResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// API 错误类型
export interface ApiError {
  code: number
  message: string
  error?: string
  timestamp: string
}

// 请求参数基础类型
export interface BaseQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
} 