import { http } from '../utils/request'
import type { 
  LoginParams, 
  RegisterParams, 
  LoginResponse, 
  User 
} from '../types/auth'

export const authAPI = {
  // 用户登录
  login: (data: LoginParams) => 
    http.post<LoginResponse>('/Auth/login', data),

  // 用户注册
  register: (data: RegisterParams) => 
    http.post<User>('/Auth/register', data),

  // 用户登出
  logout: () => 
    http.post('/Auth/logout'),

  // 获取用户信息
  getUserProfile: () => 
    http.get<User>('/Auth/profile'),

  // 更新用户信息
  updateUserProfile: (data: Partial<User>) => 
    http.put<User>('/Auth/profile', data),

  // 刷新token
  refreshToken: () => 
    http.post<{ token: string; expires_in: number }>('/Auth/refresh'),

  // 修改密码
  changePassword: (data: { old_password: string; new_password: string }) => 
    http.post('/Auth/change-password', data),

  // 重置密码（发送邮件）
  requestPasswordReset: (email: string) => 
    http.post('/Auth/reset-password', { email }),

  // 重置密码（通过token）
  resetPassword: (data: { token: string; new_password: string }) => 
    http.post('/Auth/reset-password/confirm', data)
} 