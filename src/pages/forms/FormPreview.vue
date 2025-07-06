<template>
  <div class="form-preview-container">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-container">
        <div class="header-left">
          <BrandLogo mode="mini" style="margin-right: 18px;" />
        </div>
        <div class="header-center">
          <h1 class="page-title">
            <span class="status-badge" :class="getFormStatus(currentForm?.status)" v-if="currentForm">
              <i class="mdi mdi-circle"></i>
              {{ getStatusText(getFormStatus(currentForm.status)) }}
            </span>
            <span class="form-name" v-if="currentForm">{{ currentForm.name }}</span>
          </h1>
        </div>
        <div class="header-right">
          <el-button 
            text 
            @click="goBack"
            class="back-btn"
          >
            <i class="mdi mdi-arrow-left"></i>
            返回列表
          </el-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="preview-content">
      <!-- 左侧信息面板 -->
      <div class="info-panel glass-card">
        <div class="panel-header">
          <h3>
            <i class="mdi mdi-information-outline"></i>
            表单信息
          </h3>
        </div>
        
        <div class="panel-content" v-if="currentForm">
          <!-- 基本信息 -->
          <div class="info-section">
            <h4>基本信息</h4>
            <div class="info-item">
              <label>表单名称：</label>
              <span>{{ currentForm.name }}</span>
            </div>
            <div class="info-item" v-if="currentForm.description">
              <label>表单描述：</label>
              <span>{{ currentForm.description }}</span>
            </div>
            <div class="info-item" v-if="currentForm.category">
              <label>表单分类：</label>
              <span>{{ getCategoryText(currentForm.category) }}</span>
            </div>
            <div class="info-item">
              <label>表单状态：</label>
              <span :class="['status-tag', getFormStatus(currentForm.status)]">
                {{ getStatusText(getFormStatus(currentForm.status)) }}
              </span>
            </div>
          </div>
          
          <!-- 时间信息 -->
          <div class="info-section" v-if="currentForm.startDate || currentForm.endDate">
            <h4>时间设置</h4>
            <div class="info-item" v-if="currentForm.startDate">
              <label>开始时间：</label>
              <span>{{ formatDateTime(currentForm.startDate) }}</span>
            </div>
            <div class="info-item" v-if="currentForm.endDate">
              <label>结束时间：</label>
              <span>{{ formatDateTime(currentForm.endDate) }}</span>
            </div>
            <div class="info-item">
              <label>当前状态：</label>
              <span :class="['time-status', timeStatus]">
                {{ getTimeStatusText() }}
              </span>
            </div>
          </div>
          
          <!-- 统计信息 -->
          <div class="info-section">
            <h4>统计数据</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ currentForm.viewCount || 0 }}</div>
                <div class="stat-label">浏览次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ currentForm.submitCount || 0 }}</div>
                <div class="stat-label">提交次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ componentCount }}</div>
                <div class="stat-label">组件数量</div>
              </div>
            </div>
          </div>
          
          <!-- 操作历史 -->
          <div class="info-section">
            <h4>操作信息</h4>
            <div class="history-item">
              <i class="mdi mdi-calendar-plus"></i>
              <span>创建时间：{{ formatDateTime(currentForm.createdAt) }}</span>
            </div>
            <div class="history-item">
              <i class="mdi mdi-calendar-edit"></i>
              <span>更新时间：{{ formatDateTime(currentForm.updatedAt) }}</span>
            </div>
            <div class="history-item" v-if="currentForm.createdByName">
              <i class="mdi mdi-account"></i>
              <span>创建者：{{ currentForm.createdByName }}</span>
            </div>
          </div>
          
          <!-- 分享信息 -->
          <div class="info-section" v-if="currentForm.status && getFormStatus(currentForm.status) === 'published'">
            <h4>分享链接</h4>
            <div class="share-item">
              <el-input
                :value="shareUrl"
                readonly
                class="share-input"
              >
                <template #append>
                  <el-button @click="copyShareUrl">
                    <i class="mdi mdi-content-copy"></i>
                  </el-button>
                </template>
              </el-input>
            </div>
            <div class="share-tips">
              <i class="mdi mdi-information-outline"></i>
              <span>用户可通过此链接填写表单</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧预览区域 -->
      <div class="preview-area">
        <div class="preview-wrapper glass-card">
          <div class="preview-header-bar">
            <div class="preview-title">
              <h3>
                <i class="mdi mdi-eye-outline"></i>
                表单预览
              </h3>
            </div>
            <div class="preview-actions">
              <el-button 
                @click="editForm" 
                v-if="canEdit"
                class="action-btn edit-btn"
              >
                <i class="mdi mdi-pencil-outline"></i>
                设计
              </el-button>
              <el-button 
                @click="publishForm" 
                v-if="currentForm?.status !== undefined && getFormStatus(currentForm.status) === 'draft'"
                class="action-btn publish-btn"
              >
                <i class="mdi mdi-publish"></i>
                发布
              </el-button>
              <el-button 
                @click="shareForm" 
                v-if="currentForm?.status && getFormStatus(currentForm.status) === 'published'"
                class="action-btn share-btn"
              >
                <i class="mdi mdi-share-variant-outline"></i>
                分享
              </el-button>
              <el-button 
                @click="fillForm"
                v-if="currentForm?.status && getFormStatus(currentForm.status) === 'published'"
                class="action-btn fill-btn"
              >
                <i class="mdi mdi-file-document-edit-outline"></i>
                前往填写
              </el-button>
            </div>
                      </div>
            <div class="preview-content-area">
            <div class="preview-frame">
              <!-- 加载状态 -->
              <div v-if="loading" class="loading-state" v-loading="loading" element-loading-text="加载中...">
                <div style="height: 200px;"></div>
              </div>
              
              <!-- 表单渲染器 -->
              <FormRenderer
                v-else-if="currentForm && formConfig && formConfig.components && formConfig.components.length > 0"
                :form-config="formConfig"
                :form-info="currentForm"
                :readonly="false"
                :show-submit="true"
                class="preview-renderer"
                @submit="handlePreviewSubmit"
                @reset="handlePreviewReset"
                @buttonClick="handleButtonClick"
              />
              
              <!-- 空状态 -->
              <div v-else-if="!loading" class="empty-preview">
                <i class="mdi mdi-file-document-outline"></i>
                <h4>表单配置为空</h4>
                <p>请先在设计器中添加表单组件</p>
                <el-button type="primary" @click="editForm">
                  前往设计
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分享弹窗 -->
    <el-dialog 
      v-model="shareDialogVisible" 
      title="分享表单" 
      width="500px"
      class="glass-dialog"
    >
      <div class="share-dialog-content">
        <div class="share-method">
          <h4>分享链接</h4>
          <el-input
            :value="shareUrl"
            readonly
            class="share-url-input"
          >
            <template #append>
              <el-button @click="copyShareUrl">复制链接</el-button>
            </template>
          </el-input>
        </div>
        
        <div class="share-qr" v-if="shareUrl">
          <h4>二维码分享</h4>
          <div class="qr-code" style="display: flex; flex-direction: column; align-items: center;">
            <QrcodeVue :value="shareUrl" :size="120" />
            <div style="text-align:center;font-size:12px;color:#888;margin-top:8px;">扫码填写</div>
          </div>
        </div>
        
        <div class="share-tips">
          <el-alert
            title="分享提示"
            description="只有已发布的表单才能被用户填写。分享链接永久有效，直到表单被删除或禁用。"
            type="info"
            show-icon
            :closable="false"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="shareDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormsStore } from '../../store/forms'
import { storeToRefs } from 'pinia'
import type { FormStatus } from '../../types/forms'
import { FormStatusUtils } from '../../types/forms'
import FormRenderer from '../../components/FormRenderer.vue'
import QrcodeVue from 'qrcode.vue'
import BrandLogo from '../../components/BrandLogo.vue'

const router = useRouter()
const route = useRoute()
const formsStore = useFormsStore()
const { currentForm } = storeToRefs(formsStore)

// 辅助函数：安全获取表单状态
const getFormStatus = (status: FormStatus | number): FormStatus => {
  return typeof status === 'number' ? FormStatusUtils.toString(status) : status
}

// 页面状态
const formId = computed(() => {
  const id = route.params.id as string
  if (!id || isNaN(Number(id))) {
    ElMessage.error('无效的表单ID')
    router.push('/forms')
    return ''
  }
  return id
})
const loading = ref(true)
const shareDialogVisible = ref(false)

// 表单配置
const formConfig = computed(() => {
  if (!currentForm.value?.configJson) {
    console.log('表单配置为空')
    return null
  }
  
  try {
    let configData = currentForm.value.configJson
    console.log('原始 configJson:', configData, '类型:', typeof configData)
    
    // 如果 configJson 已经是对象，直接使用
    if (typeof configData === 'object') {
      console.log('configJson 已经是对象:', configData)
      return configData
    }
    
    // 如果是字符串，需要解析
    if (typeof configData === 'string') {
      // 检查是否是无效的字符串
      if (configData === 'string' || configData === 'null' || configData === 'undefined') {
        console.log('configJson 是无效字符串:', configData)
        return null
      }
      
      let parsed: any
      
      try {
        // 尝试直接解析
        parsed = JSON.parse(configData)
        console.log('第一次解析结果:', parsed)
        
        // 如果解析后还是字符串，说明是双重编码，需要再次解析
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed)
          console.log('第二次解析结果:', parsed)
        }
      } catch (firstError) {
        console.log('第一次解析失败，尝试处理双重编码:', firstError)
        
        // 如果第一次解析失败，可能是双重编码的问题
        // 检查是否以双引号开头和结尾
        if (configData.startsWith('"') && configData.endsWith('"')) {
          try {
            // 去掉外层双引号，然后解析
            const innerJson = configData.slice(1, -1)
            parsed = JSON.parse(innerJson)
            console.log('处理双重编码后的结果:', parsed)
          } catch (secondError) {
            console.error('处理双重编码也失败:', secondError)
            throw secondError
          }
        } else {
          throw firstError
        }
      }
      
      // 检查解析后的数据是否有效
      if (!parsed || typeof parsed !== 'object') {
        console.log('解析后的数据无效:', parsed)
        return null
      }
      
      // 如果已经有 components 属性，直接返回
      if (parsed.components && Array.isArray(parsed.components)) {
        console.log('直接使用 components:', parsed.components)
        return parsed
      }
      
      // 将 widgetList 转换为 components 格式，适配 FormRenderer
      if (parsed.widgetList && Array.isArray(parsed.widgetList)) {
        const components = parsed.widgetList.map((widget: any) => {
          // 根据组件类型处理默认值
          let processedDefaultValue = widget.defaultValue
          
          switch (widget.type) {
            case 'RateWidget':
              // RateWidget需要数字类型的默认值
              processedDefaultValue = widget.defaultValue !== undefined && widget.defaultValue !== null 
                ? Number(widget.defaultValue) 
                : 0
              break
            case 'CheckboxWidget':
              // CheckboxWidget根据是否有options决定类型
              if (Array.isArray(widget.options) && widget.options.length > 0) {
                // 多选组模式，需要数组
                processedDefaultValue = Array.isArray(widget.defaultValue) ? widget.defaultValue : []
              } else {
                // 单个复选框模式，需要布尔值
                processedDefaultValue = widget.defaultValue === true || widget.defaultValue === 'true' || widget.defaultValue === 1
              }
              break
            case 'UploadWidget':
              // UploadWidget需要数组类型的默认值
              processedDefaultValue = Array.isArray(widget.defaultValue) ? widget.defaultValue : []
              break
            default:
              // 其他组件使用原始默认值或空字符串
              processedDefaultValue = widget.defaultValue !== undefined && widget.defaultValue !== null 
                ? widget.defaultValue 
                : ''
          }
          
          // 直接返回widget，让FormRenderer使用widgets组件库
          return {
            ...widget,
            // 确保有必要的字段
            field: widget.id,
            required: widget.required || false,
            defaultValue: processedDefaultValue
          }
        })
        
        console.log('转换后的组件配置:', { components })
        return { components }
      }
      
      return parsed
    }
  } catch (error) {
    console.error('解析表单配置失败:', error)
    ElMessage.error('表单配置格式错误')
  }
  
  return null
})

// 组件数量
const componentCount = computed(() => {
  if (formConfig.value?.components) {
    return formConfig.value.components.length
  }
  // 如果没有 components，尝试从原始数据中获取
  if (currentForm.value?.configJson) {
    try {
      let configData = currentForm.value.configJson
      
      // 检查是否是无效的字符串
      if (typeof configData === 'string' && (configData === 'string' || configData === 'null' || configData === 'undefined')) {
        return 0
      }
      
      if (typeof configData === 'string') {
        let parsed: any
        
        try {
          // 尝试直接解析
          parsed = JSON.parse(configData)
          
          // 如果解析后还是字符串，说明是双重编码，需要再次解析
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed)
          }
        } catch (firstError) {
          // 如果第一次解析失败，可能是双重编码的问题
          if (configData.startsWith('"') && configData.endsWith('"')) {
            // 去掉外层双引号，然后解析
            const innerJson = configData.slice(1, -1)
            parsed = JSON.parse(innerJson)
          } else {
            throw firstError
          }
        }
        
        if (parsed.widgetList && Array.isArray(parsed.widgetList)) {
          return parsed.widgetList.length
        }
        
        if (parsed.components && Array.isArray(parsed.components)) {
          return parsed.components.length
        }
      }
    } catch (error) {
      console.error('计算组件数量失败:', error)
    }
  }
  return 0
})

// 权限检查
const canEdit = computed(() => {
  // 这里可以根据用户权限判断是否可以编辑
  return true
})

// 时间状态
const timeStatus = computed(() => {
  if (!currentForm.value) return 'unknown'
  
  const now = new Date()
  const startDate = currentForm.value.startDate ? new Date(currentForm.value.startDate) : null
  const endDate = currentForm.value.endDate ? new Date(currentForm.value.endDate) : null
  
  if (startDate && now < startDate) return 'not-started'
  if (endDate && now > endDate) return 'ended'
  return 'active'
})

// 分享链接
const shareUrl = computed(() => {
  if (currentForm.value?.status && getFormStatus(currentForm.value.status) === 'published') {
    const baseUrl = window.location.origin
    const formKey = currentForm.value.formKey || currentForm.value.id
    return `${baseUrl}/fill/${formKey}`
  }
  return ''
})

// 页面初始化
onMounted(async () => {
  await loadFormData()
})

// 加载表单数据
const loadFormData = async () => {
  try {
    loading.value = true
    
    console.log('开始加载表单数据，ID:', formId.value)
    await formsStore.fetchFormDetail(Number(formId.value))
    
    console.log('表单数据加载完成:', currentForm.value)
    
    if (!currentForm.value) {
      ElMessage.error('表单不存在或已被删除')
      router.push('/forms')
      return
    }
    
    // 检查表单配置是否有效
    if (currentForm.value.configJson) {
      console.log('表单配置存在，解析中...')
    } else {
      console.log('表单配置为空')
    }
  } catch (error) {
    ElMessage.error('加载表单数据失败')
    console.error('Load form error:', error)
    router.push('/forms')
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/forms')
}

// 编辑表单
const editForm = () => {
  router.push(`/designer/${formId.value}`)
}

// 前往填写
const fillForm = () => {
  if (currentForm.value && getFormStatus(currentForm.value.status) === 'published') {
    const fillUrl = `/fill/${currentForm.value.formKey || currentForm.value.id}`
    window.open(fillUrl, '_blank')
  } else {
    ElMessage.warning('只有已发布的表单才能填写')
  }
}

// 发布表单
const publishForm = async () => {
  if (!currentForm.value) return
  
  try {
    await ElMessageBox.confirm(
      `确定要发布表单"${currentForm.value.name}"吗？发布后用户将可以填写此表单。`,
      '发布确认',
      { 
        confirmButtonText: '确定发布',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await formsStore.updateFormStatus(currentForm.value.id, 'published')
    ElMessage.success('表单发布成功！')
    
    // 重新加载表单数据以更新状态
    await loadFormData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('表单发布失败')
    }
  }
}

// 分享表单
const shareForm = () => {
  if (!currentForm.value?.status || getFormStatus(currentForm.value.status) !== 'published') {
    ElMessage.warning('只有已发布的表单才能分享')
    return
  }
  shareDialogVisible.value = true
}

// 复制分享链接
const copyShareUrl = async () => {
  if (!shareUrl.value) return
  
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = shareUrl.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('链接已复制到剪贴板')
  }
}

// 预览表单提交（仅演示）
const handlePreviewSubmit = (data: Record<string, any>) => {
  console.log('预览模式下的表单提交:', data)
  ElMessage.success('表单提交成功！这是预览模式，数据不会真正保存到数据库')
}

// 预览表单重置
const handlePreviewReset = () => {
  ElMessage.info('表单已重置')
}

// 处理按钮点击
const handleButtonClick = (component: any) => {
  console.log('按钮点击:', component)
  ElMessage.info(`点击了 "${component.props?.label}" 按钮`)
}

// 获取状态文本
const getStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
    disabled: '已禁用'
  }
  return statusMap[status || 'draft'] || status
}

// 获取分类文本
const getCategoryText = (category?: string) => {
  const categoryMap: Record<string, string> = {
    survey: '问卷调查',
    collection: '信息收集',
    registration: '活动报名',
    feedback: '意见反馈',
    other: '其他'
  }
  return categoryMap[category || 'other'] || category
}

// 获取时间状态文本
const getTimeStatusText = () => {
  const statusMap: Record<string, string> = {
    'not-started': '未开始',
    'active': '进行中',
    'ended': '已结束',
    'unknown': '未设置'
  }
  return statusMap[timeStatus.value] || '未知'
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped lang="scss">
.form-preview-container {
  background: #f5f6fa;
  min-height: 100vh;
}

.top-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  .header-container {
    max-width: none;
    margin: 0;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: none;
    border-radius: 0;
    box-shadow: none;
  }
  .header-left {
    flex: 1;
    display: flex;
    align-items: center;
    background: none;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
    min-width: 0;
  }
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    .page-title {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 26px;
      font-weight: 700;
      color: #2c3e50;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      .status-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        i {
          font-size: 8px;
        }
      }
      .form-name {
        font-size: 18px;
        font-weight: 600;
        color: #764ba2;
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .header-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .back-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.3s;
      i {
        font-size: 16px;
        margin-right: 6px;
      }
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        color: #fff;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
      }
    }
  }
}

.preview-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  min-height: calc(100vh - 200px);
}

.info-panel {
  padding: 0;
  
  .panel-header {
    padding: 20px 24px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    
    h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      
      i {
        color: #667eea;
      }
    }
  }
  
  .panel-content {
    padding: 24px;
  }
  
  .info-section {
    margin-bottom: 32px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h4 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
    }
    
    .info-item {
      display: flex;
      margin-bottom: 12px;
      
      label {
        min-width: 80px;
        color: #7f8c8d;
        font-size: 13px;
      }
      
      span {
        flex: 1;
        color: #2c3e50;
        font-size: 13px;
        
        &.status-tag {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          
          &.draft {
            background: #fdf2ec;
            color: #e6a23c;
          }
          
          &.published {
            background: #f0f9ff;
            color: #67c23a;
          }
          
          &.archived {
            background: #f5f5f5;
            color: #909399;
          }
          
          &.disabled {
            background: #fef0f0;
            color: #f56c6c;
          }
        }
        
        &.time-status {
          font-weight: 500;
          
          &.not-started { color: #e6a23c; }
          &.active { color: #67c23a; }
          &.ended { color: #909399; }
          &.unknown { color: #95a5a6; }
        }
      }
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    
    .stat-item {
      text-align: center;
      padding: 12px 8px;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 8px;
      
      .stat-number {
        font-size: 18px;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 11px;
        color: #7f8c8d;
      }
    }
  }
  
  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #7f8c8d;
    
    i {
      color: #667eea;
      font-size: 14px;
    }
  }
  
  .share-item {
    margin-bottom: 12px;
    
    .share-input {
      :deep(.el-input-group__append) {
        padding: 0;
        
        .el-button {
          border: none;
          background: #667eea;
          color: white;
          padding: 0 12px;
          
          &:hover {
            background: #5a6fd8;
          }
        }
      }
    }
  }
  
  .share-tips {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #95a5a6;
    
    i {
      color: #f39c12;
    }
  }
}

.preview-area {
  display: flex;
  flex-direction: column;
}

.preview-wrapper {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  
  .preview-header-bar {
    padding: 16px 24px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .preview-title {
      h3 {
        margin: 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        
        i {
          color: #667eea;
        }
      }
    }
    
    .preview-actions {
      display: flex;
      gap: 8px;
      
      .action-btn {
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        
        i {
          font-size: 14px;
        }
        
        &.refresh-btn,
        &.edit-btn,
        &.share-btn,
        &.fill-btn,
        &.publish-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          
          &:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
        }
      }
    }
  }
  
  .preview-content-area {
    flex: 1;
    padding: 24px;
    // background: #f8f9fa;
    
    .preview-frame {
      // background: white;
      border-radius: 12px;
      overflow: hidden;
      min-height: 600px;
      // box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      margin: 0 auto;
      max-width: 100%;
    }
  }
  
  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    position: relative;
  }
  
  .empty-preview {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 400px;
    color: #95a5a6;
    
    i {
      font-size: 64px;
      margin-bottom: 16px;
      color: #bdc3c7;
    }
    
    h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #7f8c8d;
    }
    
    p {
      margin: 0 0 24px 0;
      font-size: 14px;
    }
  }
}

// 分享弹窗样式
.share-dialog-content {
  .share-method {
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 16px;
    }
    
    .share-url-input {
      :deep(.el-input-group__append) {
        padding: 0;
        
        .el-button {
          border: none;
          background: #667eea;
          color: white;
          
          &:hover {
            background: #5a6fd8;
          }
        }
      }
    }
  }
  
  .share-qr {
    margin-bottom: 24px;
    text-align: center;
    
    h4 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 16px;
    }
    
    .qr-code {
      display: inline-block;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .qr-placeholder {
        width: 120px;
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #95a5a6;
        
        i {
          font-size: 48px;
          margin-bottom: 8px;
        }
        
        p {
          margin: 0;
          font-size: 12px;
        }
      }
    }
  }
  
  .share-tips {
    margin-top: 20px;
  }
}
.glass-dialog {
  border-radius: 18px !important;
  overflow: hidden;
  background: rgba(255,255,255,0.95) !important;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(102,126,234,0.12);
  .el-dialog__header {
    border-bottom: none;
    padding-bottom: 0;
    h4, .el-dialog__title {
      font-size: 20px;
      font-weight: 700;
      color: #2c3e50;
    }
  }
  .el-dialog__body {
    padding: 32px 32px 16px 32px;
  }
  .el-dialog__footer {
    border-top: none;
    padding-top: 0;
  }
}

.share-dialog-content {
  .share-method {
    margin-bottom: 24px;
    h4 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
    }
    .share-url-input {
      .el-input__wrapper {
        border-radius: 10px;
      }
      .el-button {
        border-radius: 10px;
      }
    }
  }
  .share-qr {
    margin-bottom: 24px;
    .qr-code {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(102,126,234,0.08);
      padding: 24px 32px 12px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 auto;
      width: fit-content;
      min-width: 180px;
    }
    h4 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    }
    .qr-code > div:last-child {
      color: #b0b3b8;
      font-size: 13px;
      margin-top: 10px;
    }
  }
  .share-tips {
    margin-top: 20px;
    .el-alert {
      border-radius: 10px;
    }
  }
}
.share-url-input {
  max-width: 95%;
  margin: 0 auto 0 auto;
  // display: block;
}
.share-url-input .el-input__wrapper {
  border-radius: 10px;
}
.share-url-input .el-button {
  border-radius: 10px;
}
</style> 