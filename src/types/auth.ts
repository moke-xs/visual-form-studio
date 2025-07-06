// 用户信息
export interface User {
  Id: number
  UserName: string
  Email: string
  FullName?: string
  AvatarUrl?: string
  Roles?: string[]
  LastLogin?: string
}

// 角色信息
export interface Role {
  id: number
  name: string
  description?: string
  permissions_json: any
  created_at: string
}

// 登录参数
export interface LoginParams {
  userNameOrEmail: string
  password: string
  rememberMe?: boolean
}

// 注册参数
export interface RegisterParams {
  userName: string
  email: string
  password: string
  fullName?: string
}

// 登录响应
export interface LoginResponse {
  Token: string
  RefreshToken: string
  ExpiresAt: string
  User: User
}

// 权限信息
export interface Permission {
  module: string
  actions: string[]
}

// 用户查询参数
export interface UserQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  role_id?: number
  is_active?: boolean
} 