import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 字段名标准化函数 - 将首字母大写的字段名转换为小写（响应数据）
const normalizeFieldNames = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(normalizeFieldNames)
  }
  
  const normalized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    // 将首字母大写的字段名转换为小写
    const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1)
    normalized[normalizedKey] = normalizeFieldNames(value)
    
    // 调试日志：显示字段名转换
    if (import.meta.env.DEV && key !== normalizedKey) {
      console.log(`响应字段名转换: ${key} -> ${normalizedKey}`)
    }
  }
  
  return normalized
}

// 字段名大写化函数 - 将小写字段名转换为首字母大写（请求数据）
const capitalizeFieldNames = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(capitalizeFieldNames)
  }
  
  const capitalized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    // 将首字母小写的字段名转换为大写
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1)
    capitalized[capitalizedKey] = capitalizeFieldNames(value)
    
    // 调试日志：显示字段名转换
    if (import.meta.env.DEV && key !== capitalizedKey) {
      console.log(`请求字段名转换: ${key} -> ${capitalizedKey}`)
    }
  }
  
  return capitalized
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 确保请求头存在
    config.headers = config.headers || {}
    
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 根据数据类型动态设置Content-Type（浏览器会自动处理Host和Content-Length）
    if (config.data) {
      if (config.data instanceof FormData) {
        // FormData类型，让浏览器自动设置Content-Type
        delete config.headers['Content-Type']
      } else if (typeof config.data === 'object') {
        // JSON数据，将字段名转换为大写
        config.headers['Content-Type'] = 'application/json'
        // 将字段名转换为大写格式
        const capitalizedData = capitalizeFieldNames(config.data)
        // 确保数据被序列化为JSON字符串
        if (typeof capitalizedData !== 'string') {
          config.data = JSON.stringify(capitalizedData)
        } else {
          config.data = capitalizedData
        }
      }
      // 不设置Content-Length，让浏览器自动计算
    }
    
    // 处理查询参数，将字段名转换为大写
    if (config.params && typeof config.params === 'object') {
      config.params = capitalizeFieldNames(config.params)
    }
    
    // 添加时间戳防止缓存 (仅GET请求)
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    // 打印请求信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'Accept': config.headers['Accept'],
          'Authorization': config.headers['Authorization'] ? '***' : undefined,
          'Cache-Control': config.headers['Cache-Control']
        },
        dataType: typeof config.data,
        dataLength: config.data ? (typeof config.data === 'string' ? config.data.length : JSON.stringify(config.data).length) : 0
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    // 打印响应信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }
    
    // 检查响应数据格式（支持大小写字段）
    if (response.data && typeof response.data === 'object') {
      // 支持大写和小写字段名
      const code = response.data.Code || response.data.code
      const message = response.data.Message || response.data.message
      const data = response.data.Data || response.data.data
      
      // 如果有code字段，说明是标准API响应格式
      if (code !== undefined) {
      if (code === 200) {
        // 将data直接赋值给response.data，保持统一的数据格式
          response.data = normalizeFieldNames(data || response.data)
        return response
      } else {
        // 业务错误
        const errorMsg = message || '请求失败'
        ElMessage.error(errorMsg)
        console.error('❌ 业务错误:', { code, message, url: response.config.url })
        return Promise.reject(new Error(errorMsg))
      }
      } else {
        // 没有code字段，说明是直接返回数据的格式（如登录API）
        // 直接标准化字段名并返回
        response.data = normalizeFieldNames(response.data)
        return response
      }
    }
    
    // 处理其他响应格式，统一字段名
    if (response.data && typeof response.data === 'object') {
      response.data = normalizeFieldNames(response.data)
    }
    
    return response
  },
  (error) => {
    // HTTP错误处理
    let errorMessage = '网络错误'
    
    if (error.response) {
      const { status, data } = error.response
      console.log('🔴 响应拦截器错误:', { status, data })
      
      switch (status) {
        case 401:
          errorMessage = '未授权，请重新登录'
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('tokenExpiresAt')
          // 使用router跳转而不是window.location，避免页面刷新
          if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login'
          }
          break
        case 403:
          errorMessage = '没有权限访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = data?.message || data?.Message || `请求失败 (${status})`
      }
    } else if (error.request) {
      errorMessage = '网络连接失败'
    } else {
      errorMessage = error.message || '请求失败'
    }
    
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  }
)

// 封装常用的请求方法
export const http = {
  get: <T = any>(url: string, params?: any, config?: AxiosRequestConfig) => 
    request.get<T>(url, { params, ...config }),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    request.post<T>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    request.put<T>(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    request.delete<T>(url, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    request.patch<T>(url, data, config),
    
  // 上传文件专用方法
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig) => 
    request.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    })
}

export default request 