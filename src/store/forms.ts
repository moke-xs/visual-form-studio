import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formsAPI } from '../api/forms'
import type { FormItem, FormCreateParams, FormStatus } from '../types/forms'
import { FormStatusUtils } from '../types/forms'
import { ElMessage } from 'element-plus'

export const useFormsStore = defineStore('forms', () => {
  // 状态
  const formList = ref<any[]>([])
  const currentForm = ref<FormItem | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const pagination = ref({
    page: 1,
    pageSize: 20
  })
  
  // 新增：统计数据状态
  const statistics = ref({
    totalForms: 0,
    draftCount: 0,
    publishedCount: 0,
    archivedCount: 0,
    disabledCount: 0,
    totalSubmissions: 0,
    totalCreated: 0
  })

  // 计算属性
  const hasMore = computed(() => formList.value.length < total.value)
  const publishedForms = computed(() => 
    formList.value.filter(form => form.status === 'published')
  )
  const draftForms = computed(() => 
    formList.value.filter(form => form.status === 'draft')
  )

  // 获取表单列表（极简版，100%字段对得上）
  const fetchFormList = async (params?: any) => {
    loading.value = true
    try {
      const response = await formsAPI.getFormList(params)
      console.log("---------------------------")
      console.log('完整表单对象:', response)
      console.log('表单所有字段:', Object.keys(response))
      
      const data: any = response.data
      
      console.log('获取表单列表响应数据:', data)
      
      // 根据响应拦截器的处理，字段名已经标准化为小写
      formList.value = data.list || []
      total.value = data.total || 0
      pagination.value.page = data.page || 1
      pagination.value.pageSize = data.pageSize || 20
      
      // 统计信息
      const s = data.statistics || {}
      statistics.value = {
        totalForms: s.totalForms || 0,
        draftCount: s.draftCount || 0,
        publishedCount: s.publishedCount || 0,
        archivedCount: s.archivedCount || 0,
        disabledCount: s.disabledCount || 0,
        totalSubmissions: s.totalSubmissions || 0,
        totalCreated: s.totalCreated || 0
      }
      
      console.log('处理后的表单列表:', formList.value)
      console.log('统计信息:', statistics.value)
    } catch (error) {
      ElMessage.error('获取表单列表失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取表单详情
  const fetchFormDetail = async (id: number) => {
    try {
      const response = await formsAPI.getFormDetail(id)
      // 根据响应拦截器的处理，response.data 已经是标准化后的数据
      const formData = response.data || response
      currentForm.value = formData as FormItem
      return formData as FormItem
    } catch (error) {
      console.error('获取表单详情失败:', error)
      throw error
    }
  }

  // 创建表单
  const createForm = async (data: FormCreateParams) => {
    try {
      const response = await formsAPI.createForm(data)
      formList.value.unshift(response.data as FormItem)
      total.value += 1
      ElMessage.success('表单创建成功')
      return response.data as FormItem
    } catch (error) {
      console.error('创建表单失败:', error)
      throw error
    }
  }

  // 更新表单
  const updateForm = async (id: number, data: Partial<FormCreateParams>) => {
    try {
      const response = await formsAPI.updateForm(id, data)
      
      // 更新列表中的表单
      const index = formList.value.findIndex(form => form.id === id)
      if (index > -1) {
        formList.value[index] = response.data as FormItem
      }
      
      // 更新当前表单
      if (currentForm.value?.id === id) {
        currentForm.value = response.data as FormItem
      }
      
      ElMessage.success('表单更新成功')
      return response.data as FormItem
    } catch (error) {
      console.error('更新表单失败:', error)
      throw error
    }
  }

  // 删除表单
  const deleteForm = async (id: number) => {
    try {
      await formsAPI.deleteForm(id)
      
      // 从列表中移除
      const index = formList.value.findIndex(form => form.id === id)
      if (index > -1) {
        formList.value.splice(index, 1)
        total.value -= 1
      }
      
      // 清除当前表单
      if (currentForm.value?.id === id) {
        currentForm.value = null
      }
      
      ElMessage.success('表单删除成功')
    } catch (error) {
      console.error('删除表单失败:', error)
      throw error
    }
  }

  /**
   * 复制表单功能
   * @param id 源表单ID
   * @param name 新表单名称（必填）
   * @param description 新表单描述（可选）
   * @param copyData 是否复制数据（可选，默认false）
   * 交互说明：点击"复制表单"后，调用store的复制接口，成功后刷新表单列表，失败弹出错误提示。
   * UI规范：按钮和下拉菜单风格、图标、提示信息与全站一致。
   */
  const copyForm = async (id: number, params: { name: string; description?: string; copyData?: boolean }) => {
    try {
      const response = await formsAPI.copyForm(id, params)
      formList.value.unshift(response.data as FormItem)
      total.value += 1
      ElMessage.success('表单复制成功')
      return response.data as FormItem
    } catch (error) {
      console.error('复制表单失败:', error)
      ElMessage.error('表单复制失败')
      throw error
    }
  }

  /**
   * 更新表单状态
   * @param id 表单ID
   * @param status 前端状态字符串（FormStatus）
   * 说明：前端使用字符串枚举，调用API时转换为数字枚举（FormStatusCode）
   */
  const updateFormStatus = async (id: number, status: FormStatus) => {
    try {
      // 将前端字符串状态转换为后端数字状态
      const statusCode = FormStatusUtils.toCode(status)
      await formsAPI.updateFormStatus(id, statusCode.toString())
      
      // 更新列表中的表单状态
      const form = formList.value.find(f => f.id === id)
      if (form) {
        form.status = status
      }
      
      // 更新当前表单状态
      if (currentForm.value?.id === id) {
        currentForm.value.status = status
      }
      
      const statusText = {
        'published': '发布',
        'draft': '保存为草稿',
        'archived': '归档',
        'disabled': '禁用'
      }[status] || '更新'
      
      ElMessage.success(`表单${statusText}成功`)
    } catch (error) {
      console.error('更新表单状态失败:', error)
      throw error
    }
  }

  // 发布表单
  const publishForm = async (id: number) => {
    try {
      await formsAPI.publishForm(id)
      await updateFormStatus(id, 'published')
    } catch (error) {
      console.error('发布表单失败:', error)
      throw error
    }
  }

  // 清空列表（切换用户或登出时）
  const clearForms = () => {
    formList.value = []
    currentForm.value = null
    total.value = 0
    pagination.value = { page: 1, pageSize: 20 }
  }

  // 重置分页
  const resetPagination = () => {
    pagination.value.page = 1
  }

  return {
    // 状态
    formList,
    currentForm,
    loading,
    total,
    pagination,
    statistics,

    // 计算属性
    hasMore,
    publishedForms,
    draftForms,

    // 方法
    fetchFormList,
    fetchFormDetail,
    createForm,
    updateForm,
    deleteForm,
    copyForm,
    updateFormStatus,
    publishForm,
    clearForms,
    resetPagination
  }
}) 