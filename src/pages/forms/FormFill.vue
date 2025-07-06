<template>
  <div class="form-fill-page">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-container">
        <div class="header-left">
          <BrandLogo mode="mini" style="margin-right: 12px;" />
        </div>
        <div class="header-center">
          <span class="brand-name">
            {{ formInfo?.name || '善见表单' }}
          </span>
        </div>
        <div class="header-right">
          <el-button 
            @click="goBack" 
            class="back-btn"
            :icon="ArrowLeft"
            circle
            size="large"
          />
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-card">
            <el-skeleton :rows="8" animated />
            <div class="loading-text">正在加载表单...</div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <div class="error-card">
            <div class="error-icon">
              <el-icon size="64"><Warning /></el-icon>
            </div>
            <h3 class="error-title">加载失败</h3>
            <p class="error-message">{{ error }}</p>
            <div class="error-actions">
              <el-button @click="retryLoad" :icon="Refresh" type="primary">
                重新加载
              </el-button>
              <el-button @click="goBack" :icon="ArrowLeft">
                返回首页
              </el-button>
            </div>
          </div>
        </div>

        <!-- 表单内容 -->
        <div v-else-if="formInfo" class="form-content">
          <!-- 表单主体 -->
          <div class="form-main-section">
            <div class="form-card">
              <div class="form-welcome">
                <div class="welcome-content">
                  <h2 class="welcome-title">
                    <el-icon class="welcome-icon"><Edit /></el-icon>
                    开始填写表单
                  </h2>
                  <p class="welcome-desc">
                    请认真填写以下信息，我们将严格保护您的隐私安全。
                  </p>
                </div>
              </div>

              <!-- 表单渲染器 -->
              <FormRenderer
                v-if="formConfig"
                ref="formRendererRef"
                :form-config="formConfig"
                :form-info="formInfo"
                :readonly="false"
                :show-meta="false"
                :show-submit="true"
                :show-reset="true"
                submit-text="提交表单"
                @submit="handleFormSubmit"
                @reset="handleFormReset"
                class="form-renderer"
              />
              
              <!-- 无配置状态 -->
              <div v-else class="no-config-state">
                <el-empty description="表单配置为空" />
              </div>
            </div>
          </div>

          <!-- 表单状态提示 -->
          <div v-if="shouldShowStatusTip" class="form-status-section">
            <el-alert
              :title="getStatusText(formInfo.status)"
              :description="getStatusDescription(formInfo.status)"
              :type="getStatusAlertType(formInfo.status)"
              :icon="getStatusIcon(formInfo.status)"
              show-icon
              :closable="false"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- 底部信息 -->
    <footer class="page-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="help-section">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
            <span class="help-text">遇到问题？</span>
            <el-button 
              type="primary" 
              link 
              @click="showHelpDialog = true"
            >
              联系我们
            </el-button>
          </div>
          <div class="copyright">
            <span>© 2024 善见表单 - 让数据收集更简单</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- 提交成功弹窗 -->
    <el-dialog
      v-model="submitSuccessVisible"
      title="提交成功"
      width="420px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      align-center
    >
      <div class="success-dialog">
        <div class="success-icon">
          <el-icon size="80" color="#67c23a"><SuccessFilled /></el-icon>
        </div>
        <h3 class="success-title">表单提交成功！</h3>
        <p class="success-message">
          感谢您的参与，您的数据已安全提交并保存。
        </p>
        <div class="success-actions">
          <el-button @click="handleSubmitSuccess" size="large">
            返回首页
          </el-button>
          <el-button 
            type="primary" 
            @click="submitAnother" 
            size="large"
          >
            再次提交
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 帮助弹窗 -->
    <el-dialog
      v-model="showHelpDialog"
      title="联系我们"
      width="400px"
      align-center
    >
      <div class="help-dialog">
        <div class="contact-item">
          <el-icon><Message /></el-icon>
          <div class="contact-info">
            <div class="contact-title">邮箱支持</div>
            <div class="contact-detail">
              <el-button type="primary" link @click="copyEmail">
                support@shanjian.com
              </el-button>
            </div>
          </div>
        </div>
        <div class="contact-item">
          <el-icon><Link /></el-icon>
          <div class="contact-info">
            <div class="contact-title">帮助中心</div>
            <div class="contact-detail">
              <el-button 
                type="primary" 
                link 
                @click="openHelpCenter"
              >
                访问帮助中心
              </el-button>
            </div>
          </div>
        </div>
        <div class="contact-item">
          <el-icon><Clock /></el-icon>
          <div class="contact-info">
            <div class="contact-title">服务时间</div>
            <div class="contact-detail">周一至周五 9:00-18:00</div>
          </div>
      </div>
    </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Warning, 
  Refresh, 
  Document, 
  Edit,
  QuestionFilled,
  SuccessFilled,
  Message,
  Link,
  Clock
} from '@element-plus/icons-vue'
import FormRenderer from '../../components/FormRenderer.vue'
import { formsAPI } from '../../api/forms'
import type { FormItem } from '../../types/forms'
import BrandLogo from '../../components/BrandLogo.vue'

const router = useRouter()
const route = useRoute()

// 页面状态
const loading = ref(false)
const error = ref<string | null>(null)
const formInfo = ref<FormItem | null>(null)
const formConfig = ref<any>(null)
const submitSuccessVisible = ref(false)
const showHelpDialog = ref(false)

// 组件引用
const formRendererRef = ref()

// 计算属性
const formKey = computed(() => route.params.formKey as string)

const shouldShowStatusTip = computed(() => {
  if (!formInfo.value) return false
  const status = getFormStatus(formInfo.value.status)
  return status !== 'published'
})

// 页面初始化
onMounted(async () => {
  await loadFormData()
  // 添加页面标题
  document.title = `填写表单 - 善见表单`
})

onUnmounted(() => {
  // 恢复默认标题
  document.title = '善见表单'
})

// 加载表单数据
const loadFormData = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('加载表单数据，formKey:', formKey.value)
    
    if (!formKey.value) {
      throw new Error('无效的表单标识')
    }
    
    const response = await formsAPI.getFormConfig(formKey.value)
    const data = response.data || response
    
    console.log('表单数据:', data)
    
    formInfo.value = data
    
    // 更新页面标题
    if (data.name) {
      document.title = `${data.name} - 善见表单`
    }
    
    // 解析表单配置
    await parseFormConfig(data)
    
    // 检查表单状态和时间限制
    validateFormAccess(data)
    
  } catch (error: any) {
    console.error('加载表单数据失败:', error)
    handleLoadError(error)
  } finally {
    loading.value = false
  }
}

// 解析表单配置
const parseFormConfig = async (data: any) => {
  if (!data.configJson) {
    console.warn('表单没有配置数据')
    formConfig.value = null
    return
  }
  
  try {
    const configData = JSON.parse(data.configJson)
    console.log('解析后的表单配置:', configData)
    
    if (configData.widgetList && Array.isArray(configData.widgetList)) {
      const components = configData.widgetList.map(transformWidget)
      formConfig.value = { components }
      console.log('转换后的表单配置:', formConfig.value)
    } else {
      console.warn('表单配置中没有找到 widgetList')
      formConfig.value = null
    }
  } catch (error) {
    console.error('解析 configJson 失败:', error)
    formConfig.value = null
  }
}

// 组件类型转换 - 直接使用widgets组件库
const transformWidget = (widget: any) => {
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
}

// 验证表单访问权限
const validateFormAccess = (data: any) => {
  const formStatus = getFormStatus(data.status)
  
  if (formStatus !== 'published') {
    error.value = '该表单暂未发布或已被禁用'
    ElMessage.error('该表单暂未发布或已被禁用')
    return
  }
  
  if (data.startDate && new Date() < new Date(data.startDate)) {
    error.value = '表单还未开始，请稍后再试'
    ElMessage.error('表单还未开始，请稍后再试')
    return
  }
  
  if (data.endDate && new Date() > new Date(data.endDate)) {
    error.value = '表单已结束，无法再提交'
    ElMessage.error('表单已结束，无法再提交')
    return
  }
}

// 处理加载错误
const handleLoadError = (error: any) => {
  if (error.response?.status === 404) {
    error.value = '表单不存在或已被删除'
    ElMessage.error('表单不存在或已被删除')
  } else if (error.response?.status === 403) {
    error.value = '表单访问权限不足'
    ElMessage.error('表单访问权限不足')
  } else if (error.message?.includes('Network Error')) {
    error.value = '网络连接失败，请检查网络后重试'
    ElMessage.error('网络连接失败，请检查网络后重试')
  } else {
    error.value = '加载表单失败，请稍后重试'
    ElMessage.error('加载表单失败，请稍后重试')
  }
}

// 处理表单提交
const handleFormSubmit = async (formData: Record<string, any>) => {
  try {
    console.log('提交表单数据:', formData)
    console.log('表单数据键值对:', Object.entries(formData))
    console.log('表单数据是否为空:', Object.keys(formData).length === 0)
    
    // 显示提交确认
    await ElMessageBox.confirm(
      '确定要提交表单吗？提交后将无法修改。',
      '确认提交',
      {
        confirmButtonText: '确定提交',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 构建提交数据格式
    const submitData = {
      fieldValues: formData
    }
    
    console.log('构建的提交数据:', submitData)
    
    // 使用匿名用户提交API
    const response = await formsAPI.submitFormDataAnonymous(formKey.value, submitData)
    
    console.log('提交成功，响应:', response)
    
    // 显示成功弹窗
    submitSuccessVisible.value = true
    
    // 更新提交计数
    if (formInfo.value) {
      formInfo.value.submitCount = (formInfo.value.submitCount || 0) + 1
    }
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('表单提交失败:', error)
      
      // 根据错误类型显示不同的错误信息
      if (error.response?.status === 400) {
        ElMessage.error('表单数据格式错误，请检查填写内容')
      } else if (error.response?.status === 404) {
        ElMessage.error('表单不存在或已被删除')
      } else if (error.response?.status === 403) {
        ElMessage.error('表单访问权限不足')
      } else if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('提交失败，请重试')
      }
    }
  }
}

// 处理表单重置
const handleFormReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置表单吗？所有已填写的内容将被清除。',
      '确认重置',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('表单已重置')
  } catch (error) {
    // 用户取消重置
  }
}

// 处理提交成功
const handleSubmitSuccess = () => {
  submitSuccessVisible.value = false
  router.push('/')
}

// 再次提交
const submitAnother = () => {
  submitSuccessVisible.value = false
  formRendererRef.value?.resetForm()
}

// 重新加载
const retryLoad = async () => {
  await loadFormData()
}

// 返回首页
const goBack = () => {
  router.push('/')
}


// 复制邮箱
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText('support@shanjian.com')
    ElMessage.success('邮箱地址已复制到剪贴板')
  } catch (error) {
    ElMessage.warning('复制失败，请手动复制：support@shanjian.com')
  }
}

// 打开帮助中心
const openHelpCenter = () => {
  window.open('https://www.shanjian.com/help', '_blank')
}


const getFormStatus = (status: any) => {
  if (typeof status === 'number') {
    const statusMap: Record<number, string> = {
      0: 'draft',
      1: 'published',
      2: 'archived',
      3: 'disabled'
    }
    return statusMap[status] || 'draft'
  }
  return status
}

const getStatusText = (status: any) => {
  const statusStr = getFormStatus(status)
  const statusMap: Record<string, string> = {
    draft: '草稿状态',
    published: '已发布',
    archived: '已归档',
    disabled: '已禁用'
  }
  return statusMap[statusStr] || '未知状态'
}

const getStatusDescription = (status: any) => {
  const statusStr = getFormStatus(status)
  const descMap: Record<string, string> = {
    draft: '表单正在编辑中，暂时无法填写',
    published: '表单已发布，可以正常填写',
    archived: '表单已归档，不再接受新的提交',
    disabled: '表单已禁用，无法进行填写'
  }
  return descMap[statusStr] || ''
}

const getStatusAlertType = (status: any) => {
  const statusStr = getFormStatus(status)
  const typeMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
    draft: 'warning',
    published: 'success',
    archived: 'info',
    disabled: 'error'
  }
  return typeMap[statusStr] || 'info'
}

const getStatusIcon = (status: any) => {
  const statusStr = getFormStatus(status)
  const iconMap: Record<string, any> = {
    draft: Edit,
    published: SuccessFilled,
    archived: Document,
    disabled: Warning
  }
  return iconMap[statusStr] || QuestionFilled
}
</script>

<style scoped lang="scss">
// 页面整体布局
.form-fill-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
}

// 顶部导航栏
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
    padding: 16px 32px;
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
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      color: #2c3e50;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.10);
      transition: all 0.3s;
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        color: #fff;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
      }
    }
  }
}

// 主内容区域
.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
  .content-container {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 16px;
    box-sizing: border-box;
  }
}

// 加载状态
.loading-state {
  .loading-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .loading-text {
      text-align: center;
      margin-top: 20px;
      font-size: 16px;
      color: #667eea;
      font-weight: 500;
    }
  }
}

// 错误状态
.error-state {
  .error-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 48px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .error-icon {
      margin-bottom: 24px;
      color: #f56c6c;
    }
    
    .error-title {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .error-message {
      margin: 0 0 32px 0;
      font-size: 16px;
      color: #7f8c8d;
      line-height: 1.6;
    }
    
    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}

// 表单内容
    .form-content {
  .form-header-section {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .form-title-area {
      text-align: center;
      margin-bottom: 24px;
      
      .form-title {
        margin: 0 0 12px 0;
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .form-description {
        margin: 0;
        font-size: 16px;
        color: #7f8c8d;
        line-height: 1.6;
      }
    }
    
    .form-meta-info {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 20px;
        font-size: 14px;
        color: #667eea;
        font-weight: 500;
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
  
  .form-main-section {
    .form-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      .form-welcome {
        text-align: center;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        
        .welcome-content {
          .welcome-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin: 0 0 12px 0;
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            
            .welcome-icon {
              font-size: 24px;
              color: #667eea;
            }
          }
          
          .welcome-desc {
            margin: 0;
            font-size: 14px;
            color: #7f8c8d;
            line-height: 1.6;
          }
        }
      }
      
      .form-renderer {
        :deep(.el-form-item__label) {
          font-weight: 600;
          color: #2c3e50;
        }
        
        :deep(.el-input__wrapper) {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(102, 126, 234, 0.2);
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #667eea;
          }
          
          &.is-focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
        }
        
        :deep(.el-button) {
          border-radius: 12px;
          font-weight: 600;
          padding: 12px 24px;
          transition: all 0.3s ease;
          
          &.el-button--primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            
            &:hover {
              background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
            }
          }
        }
      }
      
      .no-config-state {
        padding: 40px 0;
        text-align: center;
      }
    }
  }
  
  .form-status-section {
    margin-top: 24px;
    
    :deep(.el-alert) {
      border-radius: 16px;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  }
}

// 底部信息
.page-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  padding: 24px 0;
  
  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .help-section {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .help-icon {
        font-size: 18px;
        color: #667eea;
      }
      
      .help-text {
        font-size: 14px;
        color: #7f8c8d;
      }
    }
    
    .copyright {
      font-size: 12px;
      color: #bbb;
    }
  }
}

// 弹窗样式
.success-dialog {
  text-align: center;
  padding: 24px 0;
  
  .success-icon {
    margin-bottom: 24px;
  }
  
  .success-title {
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .success-message {
    margin: 0 0 32px 0;
    font-size: 14px;
    color: #7f8c8d;
    line-height: 1.6;
  }
  
  .success-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}

.help-dialog {
  .contact-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .el-icon {
      font-size: 20px;
      color: #667eea;
    }
    
    .contact-info {
      flex: 1;
      
      .contact-title {
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4px;
      }
      
      .contact-detail {
        font-size: 13px;
        color: #7f8c8d;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .main-content .content-container {
    padding: 16px 12px;
  }
  
  .form-content {
    .form-header-section,
    .form-main-section .form-card {
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .form-meta-info {
      flex-direction: column;
      gap: 12px;
    }
  }
  
  .page-footer .footer-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .top-header .header-container {
    padding: 12px 16px;
  }
  
  .success-dialog .success-actions {
    flex-direction: column;
    gap: 12px;
  }
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .form-fill-page {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .top-header {
    background: rgba(44, 62, 80, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .form-content {
    .form-header-section,
    .form-main-section .form-card {
      background: rgba(44, 62, 80, 0.95);
      border-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style> 