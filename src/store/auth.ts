import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../api/auth'
import type { User, LoginParams, RegisterParams } from '../types/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRoles = computed(() => user.value?.Roles || [])
  const hasRole = (roleName: string) => 
    userRoles.value.includes(roleName)

  // 设置认证信息
  const setAuth = (authData: { User: User; Token: string; RefreshToken?: string; ExpiresAt?: string }) => {
    user.value = authData.User
    token.value = authData.Token
    localStorage.setItem('token', authData.Token)
    if (authData.RefreshToken) {
      localStorage.setItem('refreshToken', authData.RefreshToken)
    }
    if (authData.ExpiresAt) {
      localStorage.setItem('tokenExpiresAt', authData.ExpiresAt)
    }
  }

  // 清除认证信息
  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenExpiresAt')
  }

  // 登录
  const login = async (params: LoginParams) => {
    loading.value = true
    try {
      console.log('开始登录，参数:', params)
      const response = await authAPI.login(params)
      console.log('登录API响应:', response)
      
      const loginData = response.data as any
      console.log('登录数据:', loginData)
      
      // 检查登录数据格式（字段名已被标准化为小写）
      if (!loginData.token) {
        throw new Error('登录响应中缺少token')
      }
      
      setAuth({ 
        User: loginData.user, 
        Token: loginData.token,
        RefreshToken: loginData.refreshToken,
        ExpiresAt: loginData.expiresAt
      })
      
      console.log('认证信息已设置，当前token:', token.value)
      ElMessage.success('登录成功')
      return loginData
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (params: RegisterParams) => {
    loading.value = true
    try {
      const response = await authAPI.register(params)
      ElMessage.success('注册成功，请登录')
      return response.data
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      clearAuth()
      ElMessage.success('已退出登录')
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    if (!token.value) return
    
    try {
      const response = await authAPI.getUserProfile()
      user.value = response.data as any
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，可能token已过期
      clearAuth()
      throw error
    }
  }

  // 更新用户信息
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authAPI.updateUserProfile(data)
      user.value = response.data as any
      ElMessage.success('用户信息更新成功')
      return response.data
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }

  // 修改密码
  const changePassword = async (data: { old_password: string; new_password: string }) => {
    try {
      await authAPI.changePassword(data)
      ElMessage.success('密码修改成功')
    } catch (error) {
      console.error('修改密码失败:', error)
      throw error
    }
  }

  // 初始化认证状态
  const initAuth = async () => {
    console.log('初始化认证状态检查:', {
      hasToken: !!token.value,
      hasUser: !!user.value,
      tokenValue: token.value ? '***' : null
    })
    
    if (token.value && !user.value) {
      try {
        console.log('有token但无用户信息，尝试获取用户信息...')
        await fetchUserProfile()
        console.log('用户信息获取成功:', user.value)
      } catch (error: any) {
        console.error('初始化认证状态失败:', error)
        // 只有在明确是认证错误时才清除认证信息
        if (error.response?.status === 401) {
          console.log('认证失败，清除认证信息')
        clearAuth()
        } else {
          console.log('非认证错误，保留token')
        }
      }
    } else if (token.value && user.value) {
      console.log('认证状态已存在，用户:', user.value)
    } else {
      console.log('无认证状态')
    }
  }

  return {
    // 状态
    user,
    token,
    loading,
    
    // 计算属性
    isAuthenticated,
    userRoles,
    hasRole,
    
    // 方法
    login,
    register,
    logout,
    fetchUserProfile,
    updateProfile,
    changePassword,
    initAuth,
    setAuth,
    clearAuth
  }
}, {
  persist: {
    key: 'auth-store',
    storage: window.localStorage
  }
}) 