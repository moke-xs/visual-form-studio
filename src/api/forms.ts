import { http } from '../utils/request'
import type { 
  FormItem, 
  FormCreateParams, 
  FormQueryParams,
  FormStatistics,
  FormPermission,
  PermissionAssignParams,
  FormTemplate,
  TemplateCreateParams,
  FormDataSubmitRequest,
  FormDataSubmitResponse,
  FormDataListItem,
  FormDataQueryParams,
  FormDataStatistics,
  FormDataDetail
} from '../types/forms'
import type { PaginatedResponse } from '../types/api'

export const formsAPI = {
  // 获取表单列表
  getFormList: (params?: FormQueryParams) => 
    http.get<PaginatedResponse<FormItem>>('/Forms', params),

  // 获取表单详情
  getFormDetail: (id: number) => 
    http.get<FormItem>(`/Forms/${id}`),

  // 创建表单
  createForm: (data: FormCreateParams) => 
    http.post<FormItem>('/Forms', data),

  // 更新表单
  updateForm: (id: number, data: Partial<FormCreateParams>) => 
    http.put<FormItem>(`/Forms/${id}`, data),

  // 删除表单
  deleteForm: (id: number) => 
    http.delete(`/Forms/${id}`),

  // 复制表单（支持传递新表单名称、描述、是否复制数据）
  copyForm: (id: number, data: { name: string; description?: string; copyData?: boolean }) => 
    http.post<FormItem>(`/Forms/${id}/copy`, data),

  // 更新表单状态
  updateFormStatus: (id: number, statusCode: string) => 
    http.put(`/Forms/${id}/status`, { status: parseInt(statusCode) }),

  // 发布表单
  publishForm: (id: number) => 
    http.post(`/Forms/${id}/publish`),

  // 取消发布表单
  unpublishForm: (id: number) => 
    http.post(`/Forms/${id}/unpublish`),

  // 获取表单统计
  getFormStatistics: (id: number) => 
    http.get<FormStatistics>(`/Forms/${id}/statistics`),

  // ========== 表单数据管理相关 ==========
  
  // 获取表单数据列表
  getFormDataList: (formId: number, params?: FormDataQueryParams) => 
    http.get<PaginatedResponse<FormDataListItem>>(`/FormData/forms/${formId}/data`, params),

  // 获取表单数据详情
  getFormDataDetail: (formId: number, dataId: number) => 
    http.get<FormDataDetail>(`/FormData/forms/${formId}/data/${dataId}`),

  // 获取表单数据统计
  getFormDataStatistics: (formId: number) => 
    http.get<FormDataStatistics>(`/FormData/forms/${formId}/statistics`),

  // 提交表单数据（登录用户）
  submitFormData: (formId: number, data: FormDataSubmitRequest) => 
    http.post<FormDataSubmitResponse>(`/FormData/forms/${formId}/submit`, data),

  // 提交表单数据（匿名用户）
  submitFormDataAnonymous: (formKey: string, data: FormDataSubmitRequest) => 
    http.post<FormDataSubmitResponse>(`/FormData/submit/${formKey}`, data),

  // 导出表单数据
  exportFormData: (formId: number, params?: any) => 
    http.post(`/FormData/forms/${formId}/export`, params),

  // 删除表单数据
  deleteFormData: (formId: number, dataId: number) => 
    http.delete(`/FormData/forms/${formId}/data/${dataId}`),

  // 批量删除表单数据
  batchDeleteFormData: (formId: number, dataIds: number[]) => 
    http.post(`/FormData/forms/${formId}/data/batch-delete`, { dataIds }),

  // 标记表单数据
  flagFormData: (formId: number, dataId: number, flag: boolean) => 
    http.put(`/FormData/forms/${formId}/data/${dataId}/flag`, { flag }),

  // 导入表单数据
  importFormData: (formId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post(`/FormData/forms/${formId}/import`, formData)
  },

  // 获取表单配置（用于填写表单）
  getFormConfig: (formKey: string) => 
    http.get<FormItem>(`/Forms/key/${formKey}`),

  // ========== 权限管理相关 ==========
  
  // 获取表单权限列表
  getFormPermissions: (formId: number) => 
    http.get<FormPermission[]>(`/Forms/${formId}/permissions`),

  // 分配表单权限
  assignPermission: (formId: number, params: PermissionAssignParams) => 
    http.post(`/Forms/${formId}/permissions`, params),

  // 撤销表单权限
  revokePermission: (formId: number, userId: number) => 
    http.delete(`/Forms/${formId}/permissions/${userId}`),

  // ========== 模板相关 ==========
  
  // 获取模板列表
  getTemplateList: (params?: any) => 
    http.get<PaginatedResponse<FormTemplate>>('/Templates', params),

  // 获取模板详情
  getTemplate: (id: number) => 
    http.get<FormTemplate>(`/Templates/${id}`),

  // 基于模板创建表单
  createFromTemplate: (templateId: number, formData: Partial<FormCreateParams>) => 
    http.post<FormItem>(`/Templates/${templateId}/create-form`, formData),

  // 将表单保存为模板
  saveAsTemplate: (formId: number, templateData: TemplateCreateParams) => 
    http.post<FormTemplate>(`/Forms/${formId}/save-as-template`, templateData),

  // ========== 字段管理相关 ==========
  
  // 获取表单字段列表
  getFormFields: (formId: number) => 
    http.get(`/Forms/${formId}/fields`),

  // 更新表单字段
  updateFormFields: (formId: number, fields: any[]) => 
    http.put(`/Forms/${formId}/fields`, { fields }),

  // 保存表单配置
  saveFormConfig: (formId: number, configJson: string) => 
    http.patch(`/Forms/${formId}/config`, configJson),

  // 批量操作表单
  batchOperation: (operation: string, formIds: number[]) => 
    http.post('/Forms/batch', { operation, formIds })
} 