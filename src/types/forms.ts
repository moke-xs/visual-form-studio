import type { BaseQueryParams } from './api'

// 表单状态枚举（字符串形式，前端使用）
export type FormStatus = 'draft' | 'published' | 'archived' | 'disabled'

// 表单状态数字枚举（匹配后端）
export enum FormStatusCode {
  Draft = 0,
  Published = 1, 
  Archived = 2,
  Disabled = 3
}

// 状态转换工具
export const FormStatusUtils = {
  // 字符串转数字
  toCode: (status: FormStatus): number => {
    const map: Record<FormStatus, number> = {
      'draft': FormStatusCode.Draft,
      'published': FormStatusCode.Published,
      'archived': FormStatusCode.Archived,
      'disabled': FormStatusCode.Disabled
    }
    return map[status]
  },
  
  // 数字转字符串
  toString: (code: number): FormStatus => {
    const map: Record<number, FormStatus> = {
      [FormStatusCode.Draft]: 'draft',
      [FormStatusCode.Published]: 'published',
      [FormStatusCode.Archived]: 'archived',
      [FormStatusCode.Disabled]: 'disabled'
    }
    return map[code] || 'draft'
  }
}

// 表单基础信息（匹配API文档格式）
export interface FormItem {
  id: number
  name: string
  description?: string
  configJson?: any
  type?: string
  category?: string
  status: FormStatus | number
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  createdBy: number
  templateId?: number
  isActive?: boolean
  formKey: string
  customCss?: string
  viewCount: number
  submitCount: number
  settingsJson?: any
  createdByName?: string
  fields?: FormField[] // 添加字段数组
}

// 表单创建/更新参数（匹配API文档格式）
export interface FormCreateParams {
  name: string
  description?: string
  formKey?: string                  // 表单唯一标识符
  configJson?: any                  // 前端使用：对象格式
  type?: string
  category?: string
  startDate?: Date | string         // 前端使用：Date对象，API使用：字符串
  endDate?: Date | string           // 前端使用：Date对象，API使用：字符串
  templateId?: number
  customCss?: string
  settingsJson?: any               // 前端使用：对象格式
  fields?: FormFieldCreateParams[]  // 支持创建时同时定义字段
}

// API请求参数（发送给后端的格式）
export interface FormCreateRequest {
  name: string
  description?: string
  formKey?: string                 // 表单唯一标识符
  configJson?: string              // API使用：JSON字符串格式
  category?: string
  startDate?: string
  endDate?: string
  templateId?: number
  customCss?: string
  settingsJson?: string           // API使用：JSON字符串格式
}

// 字段创建参数
export interface FormFieldCreateParams {
  fieldName: string
  fieldLabel: string
  fieldType: string
  fieldConfig?: any
  sortOrder: number
  isRequired: boolean
  validationRules?: any
  defaultValue?: any
}

export interface FormUpdateParams extends Partial<FormCreateParams> {
  id: number
}

// 表单查询参数
export interface FormQueryParams extends BaseQueryParams {
  status?: number  // 后端API需要数字枚举值
  type?: string
  createdBy?: number
  templateId?: number
  startDate?: string
  endDate?: string
}

// 表单字段定义（匹配API文档格式）
export interface FormField {
  id: number
  fieldName: string
  fieldType: string
  fieldLabel: string
  fieldConfig?: any
  sortOrder: number
  isRequired: boolean
  isSystemField?: boolean
  validationRules?: any
  defaultValue?: any
}

// 表单数据（匹配API文档格式）
export interface FormData {
  id: number
  formId: number
  fieldValues: any
  ipAddress?: string
  userAgent?: string
  submittedAt: string
  submissionId?: string
  status: 'submitted' | 'processing' | 'completed' | 'rejected'
  submitterInfo?: any
}

// 表单数据列表项（用于数据管理页面）
export interface FormDataListItem {
  id: number
  formId: number
  formName: string
  submittedAt: string
  submittedBy?: number
  submitterName?: string
  ipAddress?: string
  fieldValues?: Record<string, any>
  status?: string
}

// 表单数据查询参数
export interface FormDataQueryParams extends BaseQueryParams {
  startDate?: string
  endDate?: string
  status?: string
  submittedBy?: number
}

// 表单数据统计
export interface FormDataStatistics {
  total: number
  today: number
  week: number
  month: number
  uniqueSubmitters: number
  avgSubmissionsPerDay: number
}

// 表单数据详情
export interface FormDataDetail extends FormDataListItem {
  fieldValues: Record<string, any>
  userAgent?: string
  submissionId?: string
  createdAt: string
  updatedAt: string
}

// 表单数据提交请求参数
export interface FormDataSubmitRequest {
  fieldValues: Record<string, any>
}

// 表单数据提交响应
export interface FormDataSubmitResponse {
  id: number
  formId: number
  formName: string
  fieldValues: Record<string, any>
  submittedAt: string
  submittedBy?: number
  submitterName?: string
  ipAddress?: string
  userAgent?: string
}

// 表单统计信息（匹配API文档格式）
export interface FormStatistics {
  totalViews: number
  totalSubmissions: number
  todayViews: number
  todaySubmissions: number
  conversionRate: number
  avgCompletionTime: number
  fieldStatistics: Array<{
    fieldName: string
    fieldLabel: string
    completionRate: number
    mostCommonValue?: any
  }>
}

// 表单权限类型
export type PermissionType = 'view' | 'edit' | 'submit' | 'manage'

// 表单权限接口
export interface FormPermission {
  id: number
  formId: number
  userId: number
  userName?: string
  userEmail?: string
  permissionType: PermissionType
  grantedAt: string
  grantedBy: number
}

// 权限分配参数
export interface PermissionAssignParams {
  userId: number
  permissionType: PermissionType
}

// 表单模板接口
export interface FormTemplate {
  id: number
  name: string
  description?: string
  category?: string
  configJson: any
  previewImage?: string
  isPublic: boolean
  usageCount: number
  rating?: number
  createdAt: string
  createdBy: number
  createdByName?: string
}

// 模板创建参数
export interface TemplateCreateParams {
  name: string
  description?: string
  category?: string
  configJson: any
  previewImage?: string
  isPublic?: boolean
}